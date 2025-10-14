(ns backend.dto.crusade
  (:import [java.time LocalTime]))

(defrecord CrusadeDto [crusade-id state-id state-abbreviation diocese-id diocese-name parish-id parish-name confession-start-time confession-end-time mass-start-time mass-end-time crusade-start-time crusade-end-time contact-name contact-phone contact-email comments])

(defrecord CrusadeUpsertDto [state-id diocese-id parish-id confession-start-time confession-end-time mass-start-time mass-end-time crusade-start-time crusade-end-time contact-name contact-phone contact-email comments])