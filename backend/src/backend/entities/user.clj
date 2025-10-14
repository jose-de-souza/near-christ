(ns backend.entities.user)

(defrecord User [id user-full-name user-email password enabled roles])  ;; roles: set of Role names as strings