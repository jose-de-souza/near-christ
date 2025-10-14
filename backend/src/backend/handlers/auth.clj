(ns backend.handlers.auth
  (:require [reitit.ring :as ring]
            [cheshire.core :as json]
            [backend.services.auth :as auth-svc]
            [backend.auth.jwt :as jwt]
            [backend.db.core :as db]
            [backend.util :as util]))

(defn login-handler [req]
  (let [tx (:tx req)
        body (json/parse-string (:body req) true)
        email (:email body)
        password (:password body)]
    (if (or (nil? email) (nil? password))
      (util/api-response false 400 "Missing email or password" nil)
      (if-let [token (auth-svc/authenticate tx email password)]
        (if-let [claims (jwt/unsign token)]
          (let [user-info {:id (:user_id claims)
                           :name (:username claims)
                           :email email
                           :roles (:roles claims)}
                response-data {:accessToken token :user user-info}]
            (util/api-response true 200 "Login successful" response-data))
          (util/api-response false 401 "Invalid token generated" nil))
        (util/api-response false 401 "Invalid credentials" nil)))))

(def routes
  ["/auth/login" {:post {:handler login-handler}}])