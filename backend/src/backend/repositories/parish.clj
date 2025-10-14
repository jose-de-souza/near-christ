(ns backend.repositories.parish
  (:require [next.jdbc :as jdbc]
            [backend.db.core :as db]))

(defn find-all [tx]
  (jdbc/execute! tx ["SELECT p.*, d.diocese_name, s.state_id, s.state_abbreviation
                      FROM parishes p
                      LEFT JOIN dioceses d ON p.diocese_id = d.diocese_id
                      LEFT JOIN states s ON p.state_id = s.state_id"]))

(defn find-by-id [tx id]
  (first (jdbc/execute! tx ["SELECT p.*, d.diocese_name, s.state_id, s.state_abbreviation
                             FROM parishes p
                             LEFT JOIN dioceses d ON p.diocese_id = d.diocese_id
                             LEFT JOIN states s ON p.state_id = s.state_id
                             WHERE p.parish_id = ?" id])))

(defn exists-by-id [tx id]
  (pos? (count (jdbc/execute! tx ["SELECT 1 FROM parishes WHERE parish_id = ?" id]))))

(defn save! [tx entity]
  (jdbc/execute-one! tx ["INSERT INTO parishes (diocese_id, parish_name, parish_st_number, parish_st_name, parish_suburb, state_id, parish_postcode, parish_phone, parish_email, parish_website)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                         RETURNING *"
                         (:diocese-id entity) (:parish-name entity) (:parish-st-number entity) (:parish-st-name entity) (:parish-suburb entity)
                         (:state-id entity) (:parish-postcode entity) (:parish-phone entity) (:parish-email entity) (:parish-website entity)]))

(defn update! [tx entity]
  (jdbc/execute-one! tx ["UPDATE parishes SET diocese_id = ?, parish_name = ?, parish_st_number = ?, parish_st_name = ?, parish_suburb = ?,
                          state_id = ?, parish_postcode = ?, parish_phone = ?, parish_email = ?, parish_website = ?
                          WHERE parish_id = ? RETURNING *"
                         (:diocese-id entity) (:parish-name entity) (:parish-st-number entity) (:parish-st-name entity) (:parish-suburb entity)
                         (:state-id entity) (:parish-postcode entity) (:parish-phone entity) (:parish-email entity) (:parish-website entity)
                         (:parish-id entity)]))

(defn delete! [tx id]
  (jdbc/execute! tx ["DELETE FROM parishes WHERE parish_id = ?" id]))

(defn count-by-diocese [tx diocese-id]
  (-> (jdbc/execute-one! tx ["SELECT COUNT(*) as cnt FROM parishes WHERE diocese_id = ?" diocese-id]) :cnt))

(defn find-state-abbrevs-by-diocese [tx diocese-id]
  (map :state_abbreviation (jdbc/execute! tx ["SELECT DISTINCT s.state_abbreviation FROM parishes p
                                               JOIN states s ON p.state_id = s.state_id
                                               WHERE p.diocese_id = ?" diocese-id])))