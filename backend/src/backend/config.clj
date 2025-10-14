(ns backend.config
  (:require [environ.core :as environ]))

(defn env []
  (keyword (or (environ/env :env) "dev")))

(defn port []
  (Integer/parseInt (or (environ/env :server-port) "8080")))

(defn db-url []
  (or (environ/env :db-url) "jdbc:postgresql://localhost:5432/nearchrist"))

(defn db-user []
  (or (environ/env :db-user) "postgres"))

(defn db-pass []
  (or (environ/env :db-pass) "postgres"))

(defn jwt-secret []
  (or (environ/env :jwt-secret-key) "your_local_dev_secret_key_that_is_long_and_secure"))