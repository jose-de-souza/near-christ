(ns backend.repositories.user
  (:require [next.jdbc :as jdbc]
            [backend.db.core :as db]))

(defn find-all [tx]
  (jdbc/execute! tx ["SELECT u.*, r.name as role_name
                      FROM users u
                      LEFT JOIN user_roles ur ON u.id = ur.user_id
                      LEFT JOIN roles r ON ur.role_id = r.id"]))

(defn find-by-id [tx id]
  (first (jdbc/execute! tx ["SELECT u.*, r.name as role_name
                             FROM users u
                             LEFT JOIN user_roles ur ON u.id = ur.user_id
                             LEFT JOIN roles r ON ur.role_id = r.id
                             WHERE u.id = ?" id])))

(defn find-by-email [tx email]
  (first (jdbc/execute! tx ["SELECT u.*, r.name as role_name
                             FROM users u
                             LEFT JOIN user_roles ur ON u.id = ur.user_id
                             LEFT JOIN roles r ON ur.role_id = r.id
                             WHERE u.user_email = ?" email])))

(defn exists-by-id [tx id]
  (pos? (count (jdbc/execute! tx ["SELECT 1 FROM users WHERE id = ?" id]))))

(defn save! [tx entity]
  (jdbc/execute-one! tx ["INSERT INTO users (user_full_name, user_email, password, enabled)
                          VALUES (?, ?, ?, ?) RETURNING *"
                         (:user-full-name entity) (:user-email entity) (:password entity) (:enabled entity)]))

(defn update! [tx entity]
  (jdbc/execute-one! tx ["UPDATE users SET user_full_name = ?, user_email = ?, password = ?, enabled = ?
                          WHERE id = ? RETURNING *"
                         (:user-full-name entity) (:user-email entity) (:password entity) (:enabled entity) (:id entity)]))

(defn delete! [tx id]
  (jdbc/execute! tx ["DELETE FROM users WHERE id = ?" id]))

(defn assign-role! [tx user-id role-id]
  (jdbc/execute! tx ["INSERT INTO user_roles (user_id, role_id) VALUES (?, ?) ON CONFLICT DO NOTHING" user-id role-id]))