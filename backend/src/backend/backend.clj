(ns backend.backend
  (:require [ring.adapter.jetty :as jetty]
            [ring.middleware.defaults :refer [site-defaults wrap-defaults]]
            [backend.handler :as handler]
            [migratus.core :as migratus]
            [clojure.tools.logging :as log])
  (:gen-class))

(defn migrate []
  (let [config {:store :database
                :migration-dir "migrations"
                :dialect :pg
                :init-script "init.sql"
                :db {:dbtype "postgresql"
                     :dbname (or (System/getenv "DB_NAME") "nearchrist")
                     :host (or (System/getenv "DB_HOST") "localhost")
                     :port (Integer/parseInt (or (System/getenv "DB_PORT") "5432"))
                     :user (or (System/getenv "DB_USER") "postgres")
                     :password (or (System/getenv "DB_PASS") "password")}}]
    (migratus/init config)
    (migratus/migrate config)))

(defn -main [& args]
  (let [port (Integer/parseInt (or (System/getenv "PORT") "8080"))]
    (migrate)
    (log/infof "Starting server on port %d" port)
    (jetty/run-jetty (wrap-defaults (handler/app) (assoc-in site-defaults [:security :anti-forgery] false))
                     {:port port :join? false})))