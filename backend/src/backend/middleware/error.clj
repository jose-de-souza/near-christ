(ns backend.middleware.error
  (:require [cheshire.core :as json]))

(defn wrap-error [handler]
  (fn [req]
    (try
      (handler req)
      (catch clojure.lang.ExceptionInfo e
        {:status 400 :body (json/generate-string {:success false :message (.getMessage e) :data nil})})
      (catch Exception e
        {:status 500 :body (json/generate-string {:success false :message (str "Internal Server Error: " (.getMessage e)) :data nil})}))))