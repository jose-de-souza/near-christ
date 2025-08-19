package com.nearchrist.backend.dto;

public record StateDto(
        Long stateId,
        String stateName,
        String stateAbbreviation
) {}