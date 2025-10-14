(ns backend.handlers.user
  (:require [reitit.ring :as ring]
            [cheshire.core :as json]
            [backend.services.user :as svc]
            [backend.middleware.auth :as auth-mw]
            [backend.db.core :as db]
            [backend.util :as util]))

(defn get-all-handler [req]
  (let [tx (:tx req)]
    (util/api-response true 200 "All users fetched" (svc/get-all tx))))

(defn get-by-id-handler [req]
  (let [tx (:tx req)
        id (parse-long (get-in req [:path-params :id]))
        entity (svc/get-by-id tx id)]
    (if entity
      (util/api-response true 200 "User fetched successfully" entity)
      (util/api-response false 404 "User not found" nil))))

(defn create-handler [req]
  (let [tx (:tx req)
        body (json/parse-string (:body req) true)
        saved (svc/create tx body)]
    (util/api-response true 201 "User created successfully" saved)))

(defn update-handler [req]
  (let [tx (:tx req)
        id (parse-long (get-in req [:path-params :id]))
        body (json/parse-string (:body req) true)
        updated (svc/update-user! tx id body)]
    (if updated
      (util/api-response true 200 "User updated successfully" updated)
      (util/api-response false 404 "User not found" nil))))

(defn delete-handler [req]
  (let [tx (:tx req)
        id (parse-long (get-in req [:path-params :id]))
        deleted (svc/delete tx id)]
    (if deleted
      (util/api-response true 200 "User deleted successfully" nil)
      (util/api-response false 404 "User not found" nil))))

(def routes
  ["/users"
   {:middleware [auth-mw/require-role "ADMIN"]}
   [""
    {:get {:handler get-all-handler}
     :post {:handler create-handler}}]
   ["/:id"
    {:get {:handler get-by-id-handler}
     :put {:handler update-handler}
     :delete {:handler delete-handler}}]])