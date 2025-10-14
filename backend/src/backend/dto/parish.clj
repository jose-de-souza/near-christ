(ns backend.dto.parish)

(defrecord ParishDto [parish-id parish-name parish-st-number parish-st-name parish-suburb parish-postcode parish-phone parish-email parish-website diocese-id diocese-name state-id state-abbreviation])

(defrecord ParishUpsertDto [parish-name parish-st-number parish-st-name parish-suburb parish-postcode parish-phone parish-email parish-website diocese-id state-id])