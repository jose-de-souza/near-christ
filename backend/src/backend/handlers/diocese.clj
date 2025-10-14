(ns backend.handlers.diocese
  (:require [reitit.ring :as ring]
            [cheshire.core :as json]
            [backend.services.diocese :as svc]
            [backend.middleware.auth :as auth-mw]
            [backend.db.core :as db]
            [backend.util :as util]))

(defn get-all-handler [req]
  (let [tx (:tx req)]
    (util/api-response true 200 "All dioceses fetched" (svc/get-all tx))))

(defn get-by-id-handler [req]
  (let [tx (:tx req)
        id (parse-long (get-in req [:path-params :id]))
        entity (svc/get-by-id tx id)]
    (if entity
      (util/api-response true 200 "Diocese fetched successfully" entity)
      (util/api-response false 404 "Diocese not found" nil))))

(defn create-handler [req]
  (let [tx (:tx req)
        body (json/parse-string (:body req) true)
        saved (svc/create tx body)]
    (util/api-response true 201 "Diocese created successfully" saved)))

(defn update-handler [req]
  (let [tx (:tx req)
        id (parse-long (get-in req [:path-params :id]))
        body (json/parse-string (:body req) true)
        updated (svc/update-diocese! tx id body)]
    (if updated
      (util/api-response true 200 "Diocese updated successfully" updated)
      (util/api-response false 404 "Diocese not found" nil))))

(defn delete-handler [req]
  (let [tx (:tx req)
        id (parse-long (get-in req [:path-params :id]))
        deleted (svc/delete tx id)]
    (if deleted
      (util/api-response true 200 "Diocese deleted successfully" nil)
      (util/api-response false 404 "Diocese not found" nil))))

(def routes
  ["/dioceses"
   [""
    {:get {:handler get-all-handler}
     :post {:middleware [auth-mw/require-role "ADMIN"]
            :handler create-handler}}]
   ["/:id"
    {:get {:handler get-by-id-handler}
     :put {:middleware [auth-mw/require-role "ADMIN"]
           :handler update-handler}
     :delete {:middleware [auth-mw/require-role "ADMIN"]
              :handler delete-handler}}]])