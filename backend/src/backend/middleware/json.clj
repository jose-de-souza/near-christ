(ns backend.middleware.json
  (:require [ring.middleware.params :refer [wrap-params]]
            [cheshire.core :as json]))

(defn wrap-json [handler]
  (fn [req]
    (let [resp (handler req)]
      (if (and (= 200 (:status resp))
               (string? (:body resp)))
        (assoc resp :headers {"Content-Type" "application/json"})
        resp))))