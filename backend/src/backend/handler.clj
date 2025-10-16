(ns backend.handler
  (:require [compojure.core :refer [defroutes GET POST PUT DELETE context]]
            [compojure.route :as route]
            [ring.util.response :refer [response status]]
            [cheshire.core :as json]
            [backend.db :as db]
            [backend.middleware :as mw]
            [buddy.sign.jwt :as jwt]
            [clj-time.core :as time]
            [clojure.string :as str]))

(defn json-response [data & [status]] ((if status (partial status) identity) (response (json/generate-string data))))

(defn generate-token [user]
  (jwt/sign {:user_id (:user_id user) :role (:user_role user) :exp (time/plus (time/now) (time/hours 24))} mw/secret))

(defn login [req]
  (let [body (json/parse-string (slurp (:body req)) true)
        user (db/find-user (:user_name body))
        valid? (and user (db/check-password (:user_password body) (:user_password user)))]
    (if valid?
      (json-response {:token (generate-token user)})
      (-> (json-response {:error "Invalid credentials"}) (status 401)))))

(defn crud-handler [table]
  (fn [req]
    (case (:request-method req)
      :get (if-let [id (get-in req [:params :id])]
             (if-let [item (db/find-by-id table id)]
               (json-response item)
               (-> (json-response {:error "Not found"}) (status 404)))
             (json-response (db/find-all table)))
      :post (let [body (json/parse-string (slurp (:body req)) true)]
              (if-let [item (db/create! table body)]
                (json-response item 201)
                (-> (json-response {:error "Create failed"}) (status 500))))
      :put (let [id (get-in req [:params :id])
                 body (json/parse-string (slurp (:body req)) true)]
             (if-let [item (db/update! table id body)]
               (json-response item)
               (-> (json-response {:error "Update failed"}) (status 500))))
      :delete (let [id (get-in req [:params :id])]
                (db/delete! table id)
                (response nil)))))

(defroutes app-routes
           (POST "/auth/login" [] login)
           (context "/states" [] (mw/wrap-jwt (crud-handler "states")))
           (context "/dioceses" [] (mw/wrap-jwt (crud-handler "dioceses")))
           (context "/parishes" [] (mw/wrap-jwt (crud-handler "parishes")))
           (context "/adoration-schedules" [] (mw/wrap-jwt (crud-handler "adorations")))
           (context "/rosary-crusades" [] (mw/wrap-jwt (crud-handler "crusades")))
           (context "/users" [] (-> (mw/wrap-jwt mw/wrap-admin) (crud-handler "users")))
           (route/not-found {:error "Not found"}))

(defn app [] app-routes)