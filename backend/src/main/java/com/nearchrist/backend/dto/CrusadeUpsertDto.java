package com.nearchrist.backend.dto;

import java.time.LocalTime;

public record CrusadeUpsertDto(
        Long stateId,
        Long dioceseId,
        Long parishId,
        LocalTime confessionStartTime,
        LocalTime confessionEndTime,
        LocalTime massStartTime,
        LocalTime massEndTime,
        LocalTime crusadeStartTime,
        LocalTime crusadeEndTime,
        String contactName,
        String contactPhone,
        String contactEmail,
        String comments
) {}