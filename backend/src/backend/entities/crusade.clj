(ns backend.entities.crusade
  (:import [java.time LocalTime]))

(defrecord Crusade [crusade-id state-id diocese-id parish-id confession-start-time confession-end-time mass-start-time mass-end-time crusade-start-time crusade-end-time contact-name contact-phone contact-email comments])