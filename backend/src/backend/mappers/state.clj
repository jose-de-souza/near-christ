(ns backend.mappers.state
  (:require [backend.dto.state :as dto]
            [backend.entities.state :as ent]))

(defn to-dto [entity]
  (dto/map->StateDto {:state-id (:state_id entity) :state-name (:state_name entity) :state-abbreviation (:state_abbreviation entity)}))

(defn to-dto-list [entities]
  (map to-dto entities))

(defn to-entity [upsert-dto]
  (ent/map->State {:state-name (:state-name upsert-dto) :state-abbreviation (:state-abbreviation upsert-dto)}))