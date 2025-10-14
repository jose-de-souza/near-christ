(ns backend.middleware.cors
  (:require [ring.middleware.cors :as cors]))

(defn wrap-cors [handler]
  (cors/wrap-cors handler
                  :access-control-allow-origin #{"http://localhost:4200" "http://nearchrist.com" "https://nearchrist.com"}
                  :access-control-allow-methods [:get :post :put :delete :options]
                  :access-control-allow-headers ["Content-Type" "Authorization"]
                  :access-control-allow-credentials? true))