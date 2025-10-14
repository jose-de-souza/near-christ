(ns backend.middleware.auth
  (:require [backend.auth.jwt :as jwt]
            [backend.config :as config]
            [backend.services.user :as user-svc]
            [backend.db.core :as db]
            [cheshire.core :as json]))

(defn wrap-jwt-auth [handler]
  (fn [req]
    (let [headers (:headers req)
          auth-header (get headers "authorization")]
      (if (and auth-header (.startsWith auth-header "Bearer "))
        (let [token (subs auth-header 7)
              claims (jwt/unsign token (config/jwt-secret))
              user (user-svc/get-by-email db/db (:sub claims))]
          (if (and user (jwt/valid? token user))
            (handler (assoc req :user claims :db db/db :tx db/db))
            {:status 401 :body (json/generate-string {:success false :message "Invalid token"})}))
        (handler req)))))

(defn require-role [role]
  (fn [handler]
    (fn [req]
      (if-let [user-roles (some-> req :user :roles)]
        (if (contains? user-roles role)
          (handler req)
          {:status 403 :body (json/generate-string {:success false :message "Insufficient role"})})
        {:status 401 :body (json/generate-string {:success false :message "Not authenticated"})}))))