(ns backend.mappers.diocese
  (:require [backend.dto.diocese :as dto]
            [backend.entities.diocese :as ent]
            [backend.repositories.parish :as parish-repo]))

(defn compute-states [db diocese-id]
  (map :state_abbreviation (parish-repo/find-state-abbrevs-by-diocese db diocese-id)))

(defn to-dto [db entity]
  (dto/map->DioceseDto {:diocese-id (:diocese_id entity)
                        :diocese-name (:diocese_name entity)
                        :diocese-street-no (:diocese_street_no entity)
                        :diocese-street-name (:diocese_street_name entity)
                        :diocese-suburb (:diocese_suburb entity)
                        :diocese-postcode (:diocese_postcode entity)
                        :diocese-phone (:diocese_phone entity)
                        :diocese-email (:diocese_email entity)
                        :diocese-website (:diocese_website entity)
                        :associated-state-abbreviations (compute-states db (:diocese_id entity))}))

(defn to-dto-list [db entities]
  (map #(to-dto db %) entities))

(defn to-entity [upsert-dto]
  (ent/map->Diocese {:diocese-name (:diocese-name upsert-dto)
                     :diocese-street-no (:diocese-street-no upsert-dto)
                     :diocese-street-name (:diocese-street-name upsert-dto)
                     :diocese-suburb (:diocese-suburb upsert-dto)
                     :diocese-postcode (:diocese-postcode upsert-dto)
                     :diocese-phone (:diocese-phone upsert-dto)
                     :diocese-email (:diocese-email upsert-dto)
                     :diocese-website (:diocese-website upsert-dto)}))