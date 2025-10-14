(ns backend.services.adoration
  (:require [backend.repositories.adoration :as repo]
            [backend.repositories.diocese :as diocese-repo]
            [backend.repositories.parish :as parish-repo]
            [backend.repositories.state :as state-repo]
            [backend.mappers.adoration :as mapper]
            [backend.db.core :as db]))

(defn get-all [tx]
  (mapper/to-dto-list (repo/find-all tx)))

(defn get-by-id [tx id]
  (some-> (repo/find-by-id tx id) (mapper/to-dto)))

(defn create [tx upsert-dto]
  (when (or (nil? (:state-id upsert-dto)) (nil? (:diocese-id upsert-dto)) (nil? (:parish-id upsert-dto)) (str/blank? (:adoration-type upsert-dto)))
    (throw (ex-info "State ID, Diocese ID, Parish ID, and Adoration Type are required" {})))
  (when-not (diocese-repo/exists-by-id tx (:diocese-id upsert-dto))
    (throw (ex-info (str "Diocese with ID " (:diocese-id upsert-dto) " does not exist") {})))
  (when-not (parish-repo/exists-by-id tx (:parish-id upsert-dto))
    (throw (ex-info (str "Parish with ID " (:parish-id upsert-dto) " does not exist") {})))
  (when-not (state-repo/exists-by-id tx (:state-id upsert-dto))
    (throw (ex-info (str "State with ID " (:state-id upsert-dto) " does not exist") {})))
  (let [entity (mapper/to-entity upsert-dto)
        saved (db/with-transaction tx (fn [t] (repo/save! t entity)))]
    (mapper/to-dto saved)))

(defn update [tx id upsert-dto]
  (when (or (nil? (:state-id upsert-dto)) (nil? (:diocese-id upsert-dto)) (nil? (:parish-id upsert-dto)) (str/blank? (:adoration-type upsert-dto)))
    (throw (ex-info "State ID, Diocese ID, Parish ID, and Adoration Type are required" {})))
  (when-not (diocese-repo/exists-by-id tx (:diocese-id upsert-dto))
    (throw (ex-info (str "Diocese with ID " (:diocese-id upsert-dto) " does not exist") {})))
  (when-not (parish-repo/exists-by-id tx (:parish-id upsert-dto))
    (throw (ex-info (str "Parish with ID " (:parish-id upsert-dto) " does not exist") {})))
  (when-not (state-repo/exists-by-id tx (:state-id upsert-dto))
    (throw (ex-info (str "State with ID " (:state-id upsert-dto) " does not exist") {})))
  (if (repo/exists-by-id tx id)
    (let [entity (assoc (mapper/to-entity upsert-dto) :adoration-id id)
          updated (db/with-transaction tx (fn [t] (repo/update! t entity)))]
      (mapper/to-dto updated))
    nil))

(defn delete [tx id]
  (if (repo/exists-by-id tx id)
    (try
      (db/with-transaction tx (fn [t] (repo/delete! t id)))
      true
      (catch Exception _ (throw (ex-info "Cannot delete Adoration because it is referenced by other records" {}))))
    false))