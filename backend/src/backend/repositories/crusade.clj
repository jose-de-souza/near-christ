(ns backend.repositories.crusade
  (:require [next.jdbc :as jdbc]
            [backend.db.core :as db]))

(defn find-all [tx]
  (jdbc/execute! tx ["SELECT c.*, s.state_abbreviation, d.diocese_name, p.parish_name
                      FROM crusades c
                      LEFT JOIN states s ON c.state_id = s.state_id
                      LEFT JOIN dioceses d ON c.diocese_id = d.diocese_id
                      LEFT JOIN parishes p ON c.parish_id = p.parish_id"]))

(defn find-by-id [tx id]
  (first (jdbc/execute! tx ["SELECT c.*, s.state_abbreviation, d.diocese_name, p.parish_name
                             FROM crusades c
                             LEFT JOIN states s ON c.state_id = s.state_id
                             LEFT JOIN dioceses d ON c.diocese_id = d.diocese_id
                             LEFT JOIN parishes p ON c.parish_id = p.parish_id
                             WHERE c.crusade_id = ?" id])))

(defn exists-by-id [tx id]
  (pos? (count (jdbc/execute! tx ["SELECT 1 FROM crusades WHERE crusade_id = ?" id]))))

(defn save! [tx entity]
  (jdbc/execute-one! tx ["INSERT INTO crusades (state_id, diocese_id, parish_id, confession_start_time, confession_end_time, mass_start_time, mass_end_time, crusade_start_time, crusade_end_time, contact_name, contact_phone, contact_email, comments)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                         RETURNING *"
                         (:state-id entity) (:diocese-id entity) (:parish-id entity) (:confession-start-time entity) (:confession-end-time entity)
                         (:mass-start-time entity) (:mass-end-time entity) (:crusade-start-time entity) (:crusade-end-time entity)
                         (:contact-name entity) (:contact-phone entity) (:contact-email entity) (:comments entity)]))

(defn update! [tx entity]
  (jdbc/execute-one! tx ["UPDATE crusades SET state_id = ?, diocese_id = ?, parish_id = ?, confession_start_time = ?, confession_end_time = ?,
                          mass_start_time = ?, mass_end_time = ?, crusade_start_time = ?, crusade_end_time = ?, contact_name = ?, contact_phone = ?,
                          contact_email = ?, comments = ? WHERE crusade_id = ? RETURNING *"
                         (:state-id entity) (:diocese-id entity) (:parish-id entity) (:confession-start-time entity) (:confession-end-time entity)
                         (:mass-start-time entity) (:mass-end-time entity) (:crusade-start-time entity) (:crusade-end-time entity)
                         (:contact-name entity) (:contact-phone entity) (:contact-email entity) (:comments entity) (:crusade-id entity)]))

(defn delete! [tx id]
  (jdbc/execute! tx ["DELETE FROM crusades WHERE crusade_id = ?" id]))

(defn find-by-filters [tx state-id diocese-id parish-id]
  (let [sql-base "SELECT c.*, s.state_abbreviation, d.diocese_name, p.parish_name
                  FROM crusades c
                  LEFT JOIN states s ON c.state_id = s.state_id
                  LEFT JOIN dioceses d ON c.diocese_id = d.diocese_id
                  LEFT JOIN parishes p ON c.parish_id = p.parish_id
                  WHERE 1=1"
        params (cond-> []
                       state-id (conj state-id)
                       diocese-id (conj diocese-id)
                       parish-id (conj parish-id))]
    (jdbc/execute! tx (into [sql-base] params))))