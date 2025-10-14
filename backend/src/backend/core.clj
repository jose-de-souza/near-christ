(ns backend.core
  (:require [org.httpkit.server :as server]
            [reitit.ring :as ring]
            [backend.config :as config]
            [backend.db.core :as db]
            [backend.middleware.cors :as cors-mw]
            [backend.middleware.json :as json-mw]
            [backend.middleware.error :as error-mw]
            [backend.middleware.auth :as auth-mw]
            [backend.handlers.auth :as auth-h]
            [backend.handlers.state :as state-h]
            [backend.handlers.role :as role-h]
            [backend.handlers.user :as user-h]
            [backend.handlers.diocese :as diocese-h]
            [backend.handlers.parish :as parish-h]
            [backend.handlers.adoration :as adoration-h]
            [backend.handlers.crusade :as crusade-h]
            [backend.db.flyway :as flyway]))

(def all-routes
  [auth-h/routes
   state-h/routes
   role-h/routes
   user-h/routes
   diocese-h/routes
   parish-h/routes
   adoration-h/routes
   crusade-h/routes])

(def router
  (ring/router all-routes))

(def app
  (-> (ring/ring-handler router)
      json-mw/wrap-json
      cors-mw/wrap-cors
      auth-mw/wrap-jwt-auth
      error-mw/wrap-error))

(defn -main [& _]
  (let [env (config/env)
        port (config/port)]
    (flyway/migrate)  ;; Safe call—catches connect errors
    (if (= env :prod)
      (server/run-server app {:port port :ssl? true})
      (server/run-server app {:port port}))
    (println (str "Server running on port " port " in " (name env)))
    @(promise)))