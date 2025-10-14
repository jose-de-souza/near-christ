(ns backend.config
  (:require [environ.core :as environ]))

(defn env []
  (keyword (environ/env :env)))

(defn port []
  (Integer/parseInt (environ/env :server-port)))

(defn db-url []
  (environ/env :db-url))

(defn db-user []
  (environ/env :db-user))

(defn db-pass []
  (environ/env :db-pass))

(defn jwt-secret []
  (environ/env :jwt-secret-key))