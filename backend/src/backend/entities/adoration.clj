(ns backend.entities.adoration
  (:import [java.time LocalTime]))

(defrecord Adoration [adoration-id state-id diocese-id parish-id adoration-type adoration-location adoration-location-type adoration-day adoration-start adoration-end])