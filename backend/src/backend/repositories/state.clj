(ns backend.repositories.state
  (:require [next.jdbc :as jdbc]
            [backend.db.core :as db]))

(defn find-all [tx]
  (jdbc/execute! tx ["SELECT * FROM states"]))

(defn find-by-id [tx id]
  (first (jdbc/execute! tx ["SELECT * FROM states WHERE state_id = ?" id])))

(defn exists-by-id [tx id]
  (pos? (count (jdbc/execute! tx ["SELECT 1 FROM states WHERE state_id = ?" id]))))

(defn save! [tx entity]
  (jdbc/execute-one! tx ["INSERT INTO states (state_name, state_abbreviation) VALUES (?, ?) RETURNING *"
                         (:state-name entity) (:state-abbreviation entity)]))

(defn update! [tx entity]
  (jdbc/execute-one! tx ["UPDATE states SET state_name = ?, state_abbreviation = ? WHERE state_id = ? RETURNING *"
                         (:state-name entity) (:state-abbreviation entity) (:state-id entity)]))

(defn delete! [tx id]
  (jdbc/execute! tx ["DELETE FROM states WHERE state_id = ?" id]))