(ns backend.db.core
  (:require [hikari-cp.core :as pool]
            [next.jdbc :as jdbc]
            [backend.config :as config]))

(defn make-datasource []
  (try
    (pool/make-datasource
      {:auto-commit        true
       :read-only          false
       :connection-timeout 30000
       :validation-timeout 5000
       :idle-timeout       600000
       :max-lifetime       1800000
       :minimum-idle       10
       :maximum-pool-size  10
       :pool-name          "db-pool"
       :adapter            "postgresql"
       :username           (config/db-user)
       :password           (config/db-pass)
       :database-name      "nearchrist"
       :server-name        "localhost"
       :port-number        5432})
    (catch Exception e
      (println "Warning: Could not create datasource during init:" (.getMessage e))
      nil)))

(def db
  {:get-ds make-datasource})  ;; Fn, not delay—call on use

(defn with-transaction [db f]
  (jdbc/with-transaction [tx (assoc db :datasource (make-datasource))] (f tx)))