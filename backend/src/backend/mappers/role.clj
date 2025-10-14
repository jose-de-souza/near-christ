(ns backend.mappers.role
  (:require [backend.dto.role :as dto]
            [backend.entities.role :as ent]))

(defn to-dto [entity]
  (dto/map->RoleDto {:id (:id entity) :name (:name entity)}))

(defn to-dto-list [entities]
  (map to-dto entities))

(defn to-entity [upsert-dto]
  (ent/map->Role {:name (:name upsert-dto)}))