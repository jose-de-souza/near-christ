(ns backend.middleware
  (:require [buddy.sign.jwt :as jwt]
            [buddy.auth.accessrules :refer [restrict]]  ; For wrap-admin
            [ring.util.request :as req]
            [ring.util.response :as resp]
            [clojure.string :as str]))

(def secret (or (System/getenv "JWT_SECRET_KEY") "secret"))

(defn extract-token [req]
  (let [auth (get-in req [:headers "authorization"])]
    (when (str/starts-with? auth "Bearer ")
      (subs auth 7))))

(defn wrap-jwt [handler]
  (fn [req]
    (if-let [token (extract-token req)]
      (try
        (let [claims (jwt/unsign token secret)]
          (handler (assoc req :identity claims)))
        (catch Exception _
          (-> (resp/response {:error "Invalid token"})
              (resp/status 401))))
      (-> (resp/response {:error "No token"})
          (resp/status 401)))))

(defn admin-only [req]
  (let [role (get-in req [:identity :role])]
    (= role "ADMIN")))

(defn wrap-admin [handler]
  (restrict handler {:handler admin-only
                     :on-error (constantly (-> (resp/response {:error "Admin only"})
                                               (resp/status 403)))}))