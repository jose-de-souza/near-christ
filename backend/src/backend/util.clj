(ns backend.util
  (:require [cheshire.core :as json]))

(defn api-response [success status message data]
  {:status status
   :headers {"Content-Type" "application/json"}
   :body (json/generate-string {:success success :status status :message message :data data})})