package com.nearchrist.backend.dto;

public record StateUpsertDto(
        String stateName,
        String stateAbbreviation
) {}