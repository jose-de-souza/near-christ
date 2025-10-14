(ns backend.dto.state)

(defrecord StateDto [state-id state-name state-abbreviation])

(defrecord StateUpsertDto [state-name state-abbreviation])