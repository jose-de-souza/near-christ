package com.nearchrist.backend.dto;

import java.time.LocalTime;

public record AdorationUpsertDto(
        Long stateId,
        Long dioceseId,
        Long parishId,
        String adorationType,
        String adorationLocation,
        String adorationLocationType,
        String adorationDay,
        LocalTime adorationStart,
        LocalTime adorationEnd
) {}