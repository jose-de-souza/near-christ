(ns backend.repositories.diocese
  (:require [next.jdbc :as jdbc]
            [backend.db.core :as db]))

(defn find-all [tx]
  (jdbc/execute! tx ["SELECT d.*, p.state_id, s.state_abbreviation
                      FROM dioceses d
                      LEFT JOIN parishes p ON d.diocese_id = p.diocese_id
                      LEFT JOIN states s ON p.state_id = s.state_id
                      ORDER BY d.diocese_name"]))

(defn find-by-id [tx id]
  (first (jdbc/execute! tx ["SELECT d.*, p.state_id, s.state_abbreviation
                             FROM dioceses d
                             LEFT JOIN parishes p ON d.diocese_id = p.diocese_id
                             LEFT JOIN states s ON p.state_id = s.state_id
                             WHERE d.diocese_id = ?" id])))

(defn exists-by-id [tx id]
  (pos? (count (jdbc/execute! tx ["SELECT 1 FROM dioceses WHERE diocese_id = ?" id]))))

(defn save! [tx entity]
  (jdbc/execute-one! tx ["INSERT INTO dioceses (diocese_name, diocese_street_no, diocese_street_name, diocese_suburb, diocese_postcode, diocese_phone, diocese_email, diocese_website)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                         RETURNING *"
                         (:diocese-name entity) (:diocese-street-no entity) (:diocese-street-name entity) (:diocese-suburb entity)
                         (:diocese-postcode entity) (:diocese-phone entity) (:diocese-email entity) (:diocese-website entity)]))

(defn update! [tx entity]
  (jdbc/execute-one! tx ["UPDATE dioceses SET diocese_name = ?, diocese_street_no = ?, diocese_street_name = ?, diocese_suburb = ?,
                          diocese_postcode = ?, diocese_phone = ?, diocese_email = ?, diocese_website = ?
                          WHERE diocese_id = ? RETURNING *"
                         (:diocese-name entity) (:diocese-street-no entity) (:diocese-street-name entity) (:diocese-suburb entity)
                         (:diocese-postcode entity) (:diocese-phone entity) (:diocese-email entity) (:diocese-website entity)
                         (:diocese-id entity)]))

(defn delete! [tx id]
  (jdbc/execute! tx ["DELETE FROM dioceses WHERE diocese_id = ?" id]))