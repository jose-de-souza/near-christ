(ns backend.mappers.parish
  (:require [backend.dto.parish :as dto]
            [backend.entities.parish :as ent]))

(defn to-dto [entity]
  (map->ParishDto {:parish-id (:parish_id entity)
                   :parish-name (:parish_name entity)
                   :parish-st-number (:parish_st_number entity)
                   :parish-st-name (:parish_st_name entity)
                   :parish-suburb (:parish_suburb entity)
                   :parish-postcode (:parish_postcode entity)
                   :parish-phone (:parish_phone entity)
                   :parish-email (:parish_email entity)
                   :parish-website (:parish_website entity)
                   :diocese-id (:diocese_id entity)
                   :diocese-name (:diocese_name entity)
                   :state-id (:state_id entity)
                   :state-abbreviation (:state_abbreviation entity)}))

(defn to-dto-list [entities]
  (map to-dto entities))

(defn to-entity [upsert-dto]
  (map->Parish {:parish-name (:parish-name upsert-dto)
                :parish-st-number (:parish-st-number upsert-dto)
                :parish-st-name (:parish-st-name upsert-dto)
                :parish-suburb (:parish-suburb upsert-dto)
                :parish-postcode (:parish-postcode upsert-dto)
                :parish-phone (:parish-phone upsert-dto)
                :parish-email (:parish-email upsert-dto)
                :parish-website (:parish-website upsert-dto)
                :diocese-id (:diocese-id upsert-dto)
                :state-id (:state-id upsert-dto)}))