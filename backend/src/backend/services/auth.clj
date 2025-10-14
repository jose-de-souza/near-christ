(ns backend.services.auth
  (:require [backend.repositories.user :as user-repo]
            [backend.auth.bcrypt :as bc]
            [backend.auth.jwt :as jwt]
            [backend.config :as config]))

(defn authenticate [db email password]
  (when-let [user (user-repo/find-by-email db email)]
    (when (bc/check password (:password user))
      (jwt/sign {:sub (:user_email user) :user_id (:id user) :roles (:roles user)}))))