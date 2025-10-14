(ns backend.db.core
  (:require [hikari-cp.core :as pool]
            [next.jdbc :as jdbc]
            [backend.config :as config]))

(defonce db-spec (atom nil))

(defn make-datasource []
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
     :port-number        5432}))

(defn get-datasource []
  (or @db-spec (reset! db-spec (make-datasource))))

(def db {:get-ds get-datasource})

(defn with-transaction [db f]
  (jdbc/with-transaction [tx (assoc db :datasource (get-datasource))] (f tx)))