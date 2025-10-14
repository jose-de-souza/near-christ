(ns backend.handlers.auth
  (:require [reitit.ring :as ring]
            [cheshire.core :as json]
            [backend.services.auth :as auth-svc]
            [backend.dto.api-response :as api]
            [backend.middleware.auth :as auth-mw]
            [backend.db.core :as db]))

(defn api-response [success status message data]
  {:status status
   :headers {"Content-Type" "application/json"}
   :body (json/generate-string {:success success :status status :message message :data data})})

(defn login-handler [req]
  (let [tx (:tx req)
        body (json/parse-string (:body req) true)
        email (:email body)
        password (:password body)]
    (if (or (nil? email) (nil? password))
      (api-response false 400 "Missing email or password" nil)
      (if-let [token (auth-svc/authenticate tx email password)]
        (let [claims (json/parse-string token true)  ;; Simplified; use jwt/unsign in prod
              user-info {:id (:user_id claims) :name (:username claims) :email email :roles (:roles claims)}
              response-data {:accessToken token :user user-info}]
          (api-response true 200 "Login successful" response-data))
        (api-response false 401 "Invalid credentials" nil)))))

(def routes
  ["/auth/login" {:post {:handler login-handler}}])