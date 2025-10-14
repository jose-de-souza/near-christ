(ns backend.handlers.state
  (:require [reitit.ring :as ring]
            [cheshire.core :as json]
            [backend.services.state :as svc]
            [backend.dto.api-response :as api]
            [backend.middleware.auth :as auth-mw]
            [backend.db.core :as db]))

(defn api-response [success status message data]
  {:status status
   :headers {"Content-Type" "application/json"}
   :body (json/generate-string {:success success :status status :message message :data data})})

(defn get-all-handler [req]
  (let [tx (:tx req)]
    (api-response true 200 "All states fetched" (svc/get-all tx))))

(defn get-by-id-handler [req]
  (let [tx (:tx req)
        id (parse-long (get-in req [:path-params :id]))
        entity (svc/get-by-id tx id)]
    (if entity
      (api-response true 200 "State fetched successfully" entity)
      (api-response false 404 "State not found" nil))))

(defn create-handler [req]
  (let [tx (:tx req)
        body (json/parse-string (:body req) true)
        saved (svc/create tx body)]
    (api-response true 201 "State created successfully" saved)))

(defn update-handler [req]
  (let [tx (:tx req)
        id (parse-long (get-in req [:path-params :id]))
        body (json/parse-string (:body req) true)
        updated (svc/update tx id body)]
    (if updated
      (api-response true 200 "State updated successfully" updated)
      (api-response false 404 "State not found" nil))))

(defn delete-handler [req]
  (let [tx (:tx req)
        id (parse-long (get-in req [:path-params :id]))
        deleted (svc/delete tx id)]
    (if deleted
      (api-response true 200 "State deleted successfully" nil)
      (api-response false 404 "State not found" nil))))

(def routes
  ["/states"
   {:get {:handler get-all-handler}
    :post {:middleware [auth-mw/require-role "ADMIN"]
           :handler create-handler}}
   ["/:id"
    {:get {:handler get-by-id-handler}
     :put {:middleware [auth-mw/require-role "ADMIN"]
           :handler update-handler}
     :delete {:middleware [auth-mw/require-role "ADMIN"]
              :handler delete-handler}}]])