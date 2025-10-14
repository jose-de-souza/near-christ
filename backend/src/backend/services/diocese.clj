(ns backend.services.diocese
  (:require [backend.repositories.diocese :as repo]
            [backend.repositories.parish :as parish-repo]
            [backend.mappers.diocese :as mapper]
            [clojure.string :as str]
            [backend.db.core :as db]))

(defn get-all [tx]
  (mapper/to-dto-list tx (repo/find-all tx)))

(defn get-by-id [tx id]
  (some-> (repo/find-by-id tx id) (mapper/to-dto tx)))

(defn create [tx upsert-dto]
  (when (str/blank? (:diocese-name upsert-dto))
    (throw (ex-info "Diocese name is required" {})))
  (let [entity (mapper/to-entity upsert-dto)
        saved (db/with-transaction tx (fn [t] (repo/save! t entity)))]
    (mapper/to-dto tx saved)))

(defn update-diocese! [tx id upsert-dto]
  (if (repo/exists-by-id tx id)
    (let [entity (assoc (mapper/to-entity upsert-dto) :diocese-id id)
          updated (db/with-transaction tx (fn [t] (repo/update! t entity)))]
      (when (str/blank? (:diocese-name upsert-dto))
        (throw (ex-info "Diocese name is required" {})))
      (mapper/to-dto tx updated))
    nil))

(defn delete [tx id]
  (if (repo/exists-by-id tx id)
    (let [count (parish-repo/count-by-diocese tx id)]
      (if (> count 0)
        (throw (ex-info (str "The diocese has " count " parishes associated. Delete parishes first.") {}))
        (do
          (db/with-transaction tx (fn [t] (repo/delete! t id)))
          true)))
    false))