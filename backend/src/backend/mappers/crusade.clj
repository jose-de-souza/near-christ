(ns backend.mappers.crusade
  (:require [backend.dto.crusade :as dto]
            [backend.entities.crusade :as ent]))

(defn to-dto [entity]
  (dto/map->CrusadeDto {:crusade-id (:crusade_id entity)
                        :state-id (:state_id entity)
                        :state-abbreviation (:state_abbreviation entity)
                        :diocese-id (:diocese_id entity)
                        :diocese-name (:diocese_name entity)
                        :parish-id (:parish_id entity)
                        :parish-name (:parish_name entity)
                        :confession-start-time (:confession_start_time entity)
                        :confession-end-time (:confession_end_time entity)
                        :mass-start-time (:mass_start_time entity)
                        :mass-end-time (:mass_end_time entity)
                        :crusade-start-time (:crusade_start_time entity)
                        :crusade-end-time (:crusade_end_time entity)
                        :contact-name (:contact_name entity)
                        :contact-phone (:contact_phone entity)
                        :contact-email (:contact_email entity)
                        :comments (:comments entity)}))

(defn to-dto-list [entities]
  (map to-dto entities))

(defn to-entity [upsert-dto]
  (ent/map->Crusade {:state-id (:state-id upsert-dto)
                     :diocese-id (:diocese-id upsert-dto)
                     :parish-id (:parish-id upsert-dto)
                     :confession-start-time (:confession-start-time upsert-dto)
                     :confession-end-time (:confession-end-time upsert-dto)
                     :mass-start-time (:mass-start-time upsert-dto)
                     :mass-end-time (:mass-end-time upsert-dto)
                     :crusade-start-time (:crusade-start-time upsert-dto)
                     :crusade-end-time (:crusade-end-time upsert-dto)
                     :contact-name (:contact-name upsert-dto)
                     :contact-phone (:contact-phone upsert-dto)
                     :contact-email (:contact-email upsert-dto)
                     :comments (:comments upsert-dto)}))