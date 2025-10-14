(ns backend.repositories.role
  (:require [next.jdbc :as jdbc]
            [backend.db.core :as db]))

(defn find-all [tx]
  (jdbc/execute! tx ["SELECT * FROM roles"]))

(defn find-by-id [tx id]
  (first (jdbc/execute! tx ["SELECT * FROM roles WHERE id = ?" id])))

(defn find-by-name [tx name]
  (first (jdbc/execute! tx ["SELECT * FROM roles WHERE name = ?" name])))

(defn exists-by-id [tx id]
  (pos? (count (jdbc/execute! tx ["SELECT 1 FROM roles WHERE id = ?" id]))))

(defn save! [tx entity]
  (jdbc/execute-one! tx ["INSERT INTO roles (name) VALUES (?) RETURNING *" (:name entity)]))

(defn update! [tx entity]
  (jdbc/execute-one! tx ["UPDATE roles SET name = ? WHERE id = ? RETURNING *" (:name entity) (:id entity)]))

(defn delete! [tx id]
  (jdbc/execute! tx ["DELETE FROM roles WHERE id = ?" id]))