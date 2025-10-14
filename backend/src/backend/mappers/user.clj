(ns backend.mappers.user
  (:require [backend.dto.user :as dto]
            [backend.entities.user :as ent]))

(defn to-dto [entity]
  (dto/map->UserDto {:id (:id entity)
                     :user-full-name (:user_full_name entity)
                     :user-email (:user_email entity)
                     :enabled (:enabled entity)
                     :roles (:roles entity)}))  ;; Already set of strings

(defn to-dto-list [entities]
  (map to-dto entities))

(defn to-entity [upsert-dto]
  (ent/map->User {:user-full-name (:user-full-name upsert-dto)
                  :user-email (:user-email upsert-dto)
                  :password (:password upsert-dto)
                  :enabled true
                  :roles #{}}))  ;; Roles set in service