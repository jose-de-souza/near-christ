(ns backend.dto.user)

(defrecord UserDto [id user-full-name user-email enabled roles])  ;; roles: set of strings

(defrecord UserUpsertDto [user-full-name user-email password roles])  ;; roles: set of strings