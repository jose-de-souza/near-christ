(ns backend.handlers.crusade
  (:require [reitit.ring :as ring]
            [cheshire.core :as json]
            [backend.services.crusade :as svc]
            [backend.middleware.auth :as auth-mw]
            [backend.db.core :as db]
            [backend.util :as util]))

(defn get-all-handler [req]
  (let [tx (:tx req)
        state-id (some-> (:query-params req) :state_id parse-long)
        diocese-id (some-> (:query-params req) :diocese_id parse-long)
        parish-id (some-> (:query-params req) :parish_id parse-long)
        all (svc/get-all tx)
        filtered (cond-> all
                         state-id (filter #(= state-id (:state-id %)))
                         diocese-id (filter #(= diocese-id (:diocese-id %)))
                         parish-id (filter #(= parish-id (:parish-id %))))]
    (util/api-response true 200 "All crusades fetched" (vec filtered))))

(defn get-by-id-handler [req]
  (let [tx (:tx req)
        id (parse-long (get-in req [:path-params :id]))
        entity (svc/get-by-id tx id)]
    (if entity
      (util/api-response true 200 "Crusade fetched successfully" entity)
      (util/api-response false 404 "Crusade not found" nil))))

(defn create-handler [req]
  (let [tx (:tx req)
        body (json/parse-string (:body req) true)
        saved (svc/create tx body)]
    (util/api-response true 201 "Crusade created successfully" saved)))

(defn update-handler [req]
  (let [tx (:tx req)
        id (parse-long (get-in req [:path-params :id]))
        body (json/parse-string (:body req) true)
        updated (svc/update-crusade! tx id body)]
    (if updated
      (util/api-response true 200 "Crusade updated successfully" updated)
      (util/api-response false 404 "Crusade not found" nil))))

(defn delete-handler [req]
  (let [tx (:tx req)
        id (parse-long (get-in req [:path-params :id]))
        deleted (svc/delete tx id)]
    (if deleted
      (util/api-response true 200 "Crusade deleted successfully" nil)
      (util/api-response false 404 "Crusade not found" nil))))

(def routes
  ["/crusades"
   {:get {:handler get-all-handler}
    :post {:middleware [auth-mw/require-role "ADMIN"]
           :handler create-handler}}
   ["/:id"
    {:get {:handler get-by-id-handler}
     :put {:middleware [auth-mw/require-role "ADMIN"]
           :handler update-handler}
     :delete {:middleware [auth-mw/require-role "ADMIN"]
              :handler delete-handler}}]])