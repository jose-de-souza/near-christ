(ns backend.repositories.adoration
  (:require [next.jdbc :as jdbc]
            [backend.db.core :as db]))

(defn find-all [tx]
  (jdbc/execute! tx ["SELECT a.*, s.state_abbreviation, d.diocese_name, p.parish_name
                      FROM adorations a
                      LEFT JOIN states s ON a.state_id = s.state_id
                      LEFT JOIN dioceses d ON a.diocese_id = d.diocese_id
                      LEFT JOIN parishes p ON a.parish_id = p.parish_id"]))

(defn find-by-id [tx id]
  (first (jdbc/execute! tx ["SELECT a.*, s.state_abbreviation, d.diocese_name, p.parish_name
                             FROM adorations a
                             LEFT JOIN states s ON a.state_id = s.state_id
                             LEFT JOIN dioceses d ON a.diocese_id = d.diocese_id
                             LEFT JOIN parishes p ON a.parish_id = p.parish_id
                             WHERE a.adoration_id = ?" id])))

(defn exists-by-id [tx id]
  (pos? (count (jdbc/execute! tx ["SELECT 1 FROM adorations WHERE adoration_id = ?" id]))))

(defn save! [tx entity]
  (jdbc/execute-one! tx ["INSERT INTO adorations (state_id, diocese_id, parish_id, adoration_type, adoration_location, adoration_location_type, adoration_day, adoration_start, adoration_end)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                         RETURNING *"
                         (:state-id entity) (:diocese-id entity) (:parish-id entity) (:adoration-type entity) (:adoration-location entity)
                         (:adoration-location-type entity) (:adoration-day entity) (:adoration-start entity) (:adoration-end entity)]))

(defn update! [tx entity]
  (jdbc/execute-one! tx ["UPDATE adorations SET state_id = ?, diocese_id = ?, parish_id = ?, adoration_type = ?, adoration_location = ?,
                          adoration_location_type = ?, adoration_day = ?, adoration_start = ?, adoration_end = ?
                          WHERE adoration_id = ? RETURNING *"
                         (:state-id entity) (:diocese-id entity) (:parish-id entity) (:adoration-type entity) (:adoration-location entity)
                         (:adoration-location-type entity) (:adoration-day entity) (:adoration-start entity) (:adoration-end entity)
                         (:adoration-id entity)]))

(defn delete! [tx id]
  (jdbc/execute! tx ["DELETE FROM adorations WHERE adoration_id = ?" id]))

(defn find-by-filters [tx state-id diocese-id parish-id]
  (let [sql-base "SELECT a.*, s.state_abbreviation, d.diocese_name, p.parish_name
                  FROM adorations a
                  LEFT JOIN states s ON a.state_id = s.state_id
                  LEFT JOIN dioceses d ON a.diocese_id = d.diocese_id
                  LEFT JOIN parishes p ON a.parish_id = p.parish_id
                  WHERE 1=1"]
    params (cond-> []
                   state-id (conj state-id)
                   diocese-id (conj diocese-id)
                   parish-id (conj parish-id))]
(jdbc/execute! tx (into [sql-base] params))))