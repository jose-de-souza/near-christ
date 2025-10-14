(ns backend.db.flyway
  (:require [org.flywaydb.core.api :as flyway]
            [backend.db.core :as db]))

(defn migrate []
  (flyway/migrate
    {:dataSource (:datasource db/db)
     :locations  ["filesystem:resources/db/migration"]}))