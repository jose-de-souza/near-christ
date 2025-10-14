(ns backend.auth.bcrypt
  (:require [buddy.hashers :as hashers]))

(defn encrypt [password]
  (hashers/encrypt password))

(defn check [plain hashed]
  (hashers/check plain hashed))