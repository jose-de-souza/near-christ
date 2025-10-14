(ns backend.mappers.adoration
  (:require [backend.dto.adoration :as dto]
            [backend.entities.adoration :as ent]))

(defn to-dto [entity]
  (dto/map->AdorationDto {:adoration-id (:adoration_id entity)
                          :state-id (:state_id entity)
                          :state-abbreviation (:state_abbreviation entity)
                          :diocese-id (:diocese_id entity)
                          :diocese-name (:diocese_name entity)
                          :parish-id (:parish_id entity)
                          :parish-name (:parish_name entity)
                          :adoration-type (:adoration_type entity)
                          :adoration-location (:adoration_location entity)
                          :adoration-location-type (:adoration_location_type entity)
                          :adoration-day (:adoration_day entity)
                          :adoration-start (:adoration_start entity)
                          :adoration-end (:adoration_end entity)}))

(defn to-dto-list [entities]
  (map to-dto entities))

(defn to-entity [upsert-dto]
  (ent/map->Adoration {:state-id (:state-id upsert-dto)
                       :diocese-id (:diocese-id upsert-dto)
                       :parish-id (:parish-id upsert-dto)
                       :adoration-type (:adoration-type upsert-dto)
                       :adoration-location (:adoration-location upsert-dto)
                       :adoration-location-type (:adoration-location-type upsert-dto)
                       :adoration-day (:adoration-day upsert-dto)
                       :adoration-start (:adoration-start upsert-dto)
                       :adoration-end (:adoration-end upsert-dto)}))