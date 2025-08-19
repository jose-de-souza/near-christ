package com.nearchrist.backend.dto;

import java.time.LocalTime;

public record AdorationDto(
        Long adorationId,
        Long stateId,
        String stateAbbreviation,
        Long dioceseId,
        String dioceseName,
        Long parishId,
        String parishName,
        String adorationType,
        String adorationLocation,
        String adorationLocationType,
        String adorationDay,
        LocalTime adorationStart,
        LocalTime adorationEnd
) {}