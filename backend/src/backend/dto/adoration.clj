(ns backend.dto.adoration
  (:import [java.time LocalTime]))

(defrecord AdorationDto [adoration-id state-id state-abbreviation diocese-id diocese-name parish-id parish-name adoration-type adoration-location adoration-location-type adoration-day adoration-start adoration-end])

(defrecord AdorationUpsertDto [state-id diocese-id parish-id adoration-type adoration-location adoration-location-type adoration-day adoration-start adoration-end])