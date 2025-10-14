(ns backend.db.flyway
  (:require [backend.db.core :as db])
  (:import [org.flywaydb.core Flyway]))

(defn migrate []
  (try
    (let [flyway (-> (Flyway/configure)
                     (.dataSource (db/get-datasource))
                     (.locations (into-array String ["filesystem:resources/db/migration"]))
                     (.load))]
      (.migrate flyway)
      (println "Migrations applied successfully"))
    (catch Exception e
      (println "Warning: Migrations skipped (DB not available):" (.getMessage e)))))