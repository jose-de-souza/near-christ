(ns backend.auth.jwt
  (:require [buddy.sign.jwt :as jwt]
            [backend.config :as config]))

(def expiration (* 3600000))  ;; 1 hour in ms

(defn sign [claims]
  (jwt/sign claims (config/jwt-secret) {:alg :hs512 :exp (+ (quot (System/currentTimeMillis) 1000) (quot expiration 1000))}))

(defn unsign [token]
  (try
    (jwt/unsign token (config/jwt-secret))
    (catch Exception _ nil)))

(defn expired? [claims]
  (let [exp-time (* (:exp claims) 1000)]  ;; Convert exp (seconds) to ms
    (>= (System/currentTimeMillis) exp-time)))

(defn valid? [token user]
  (let [claims (unsign token)]
    (and claims (= (:user-email user) (:sub claims)) (not (expired? claims)))))