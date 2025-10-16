(ns backend.db
  (:require [next.jdbc :as jdbc]
            [next.jdbc.result-set :as rs]
            [cheshire.core :as json]
            [buddy.hashers :as hashers]
            [clojure.string :as str]))

(def ds (delay (jdbc/get-datasource {:dbtype "postgresql"
                                     :dbname (or (System/getenv "DB_NAME") "nearchrist")
                                     :host (or (System/getenv "DB_HOST") "localhost")
                                     :port (Integer/parseInt (or (System/getenv "DB_PORT") "5432"))
                                     :user (or (System/getenv "DB_USER") "postgres")
                                     :password (or (System/getenv "DB_PASS") "password")})))

(defn exec! [sql params]
  (jdbc/execute! @ds [sql params]))

(defn query [sql params]
  (jdbc/execute-one! @ds [sql params] {:builder-fn rs/as-unqualified-lower-maps}))

(defn find-all [table]
  (jdbc/execute! @ds [(str "SELECT * FROM " table)] {:builder-fn rs/as-unqualified-lower-maps}))

(defn find-by-id [table id]
  (query (str "SELECT * FROM " table " WHERE " (str/replace table #"(?i)users" "user_id") " = ?") id))  ; Adjust ID field per table (user_id for users, state_id for states, etc.)

(defn create! [table data]
  (let [cols (str/join ", " (keys data))
        placeholders (str/join ", " (repeat (count data) "?"))
        sql (str "INSERT INTO " table " (" cols ") VALUES (" placeholders ") RETURNING " (str/replace table #"(?i)users" "user_id") " = ?")]  ; Return ID
    (first (jdbc/execute-one! @ds [sql (vals data)] {:builder-fn rs/as-unqualified-lower-maps}))))

(defn update! [table id data]
  (let [sets (str/join ", " (map #(str % " = ?") (keys data)))
        sql (str "UPDATE " table " SET " sets " WHERE " (str/replace table #"(?i)users" "user_id") " = ? RETURNING *")]
    (first (jdbc/execute-one! @ds [sql (interleave (vals data) [id])] {:builder-fn rs/as-unqualified-lower-maps}))))

(defn delete! [table id]
  (exec! (str "DELETE FROM " table " WHERE " (str/replace table #"(?i)users" "user_id") " = ?") id))

(defn find-user [user-name]
  (query "SELECT * FROM users WHERE user_name = ?" user-name))

(defn hash-password [pw] (hashers/derive pw))
(defn check-password [pw hashed] (hashers/check pw hashed))