(ns backend.dto.diocese)

(defrecord DioceseDto [diocese-id diocese-name diocese-street-no diocese-street-name diocese-suburb diocese-postcode diocese-phone diocese-email diocese-website associated-state-abbreviations])

(defrecord DioceseUpsertDto [diocese-name diocese-street-no diocese-street-name diocese-suburb diocese-postcode diocese-phone diocese-email diocese-website])