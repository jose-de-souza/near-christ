(ns backend.services.state
  (:require [backend.repositories.state :as repo]
            [backend.mappers.state :as mapper]
            [clojure.string :as str]
            [backend.db.core :as db]))

(defn get-all [tx]
  (mapper/to-dto-list (repo/find-all tx)))

(defn get-by-id [tx id]
  (some-> (repo/find-by-id tx id) (mapper/to-dto)))

(defn create [tx upsert-dto]
  (when (str/blank? (:state-name upsert-dto))
    (throw (ex-info "State name is required" {})))
  (let [entity (mapper/to-entity upsert-dto)
        saved (db/with-transaction tx (fn [t] (repo/save! t entity)))]
    (mapper/to-dto saved)))

(defn update-state! [tx id upsert-dto]
  (when (str/blank? (:state-name upsert-dto))
    (throw (ex-info "State name is required" {})))
  (if (repo/exists-by-id tx id)
    (let [entity (assoc (mapper/to-entity upsert-dto) :state-id id)
          updated (db/with-transaction tx (fn [t] (repo/update! t entity)))]
      (mapper/to-dto updated))
    nil))

(defn delete [tx id]
  (if (repo/exists-by-id tx id)
    (try
      (db/with-transaction tx (fn [t] (repo/delete! t id)))
      true
      (catch Exception _ (throw (ex-info "Cannot delete State because it is referenced by other records" {}))))
    false))