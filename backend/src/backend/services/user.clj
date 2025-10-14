(ns backend.services.user
  (:require [backend.repositories.user :as repo]
            [backend.repositories.role :as role-repo]
            [backend.mappers.user :as mapper]
            [backend.auth.bcrypt :as bc]
            [clojure.string :as str]
            [backend.db.core :as db]))

(defn get-all [tx]
  (let [users (repo/find-all-with-roles tx)]
    (mapper/to-dto-list users)))

(defn get-by-id [tx id]
  (some-> (repo/find-by-id tx id) mapper/to-dto))

(defn get-by-email [tx email]
  (some-> (repo/find-by-email tx email) mapper/to-dto))

(defn create [tx upsert-dto]
  (when (or (str/blank? (:user-full-name upsert-dto)) (str/blank? (:user-email upsert-dto)) (str/blank? (:password upsert-dto)))
    (throw (ex-info "User full name, email, and password are required" {})))
  (let [hashed-pw (bc/encrypt (:password upsert-dto))
        entity (-> upsert-dto (assoc :password hashed-pw :enabled true) mapper/to-entity)
        saved (db/with-transaction tx (fn [t]
                                        (let [saved-user (repo/save! t entity)
                                              role-names (:roles upsert-dto)
                                              role-ids (map #(get (role-repo/find-by-name t %) :id) role-names)]
                                          (doseq [rid role-ids]
                                            (repo/assign-role! t (:id saved-user) rid))
                                          saved-user)))]
    (assoc (mapper/to-dto saved) :roles (set (:roles upsert-dto)))))

(defn update-user! [tx id upsert-dto]
  (if (repo/exists-by-id tx id)
    (let [entity (assoc (mapper/to-entity upsert-dto) :id id)
          hashed-pw (when (not-empty (:password upsert-dto)) (bc/encrypt (:password upsert-dto)))
          entity (if hashed-pw (assoc entity :password hashed-pw) entity)]
      (db/with-transaction tx
                           (fn [t]
                             (repo/update! t entity)
                             (when-let [role-names (:roles upsert-dto)]
                               (repo/clear-user-roles! t id)
                               (doseq [name role-names]
                                 (if-let [role (role-repo/find-by-name t name)]
                                   (repo/assign-role! t id (:id role))
                                   (throw (ex-info (str "Role not found: " name) {})))))))
      (assoc (mapper/to-dto (repo/find-by-id tx id)) :roles (set (:roles upsert-dto))))
    nil))

(defn delete [tx id]
  (if (repo/exists-by-id tx id)
    (do
      (db/with-transaction tx (fn [t] (repo/delete! t id)))
      true)
    false))