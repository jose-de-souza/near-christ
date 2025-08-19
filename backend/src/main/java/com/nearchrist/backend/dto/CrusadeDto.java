package com.nearchrist.backend.dto;

import java.time.LocalTime;

public record CrusadeDto(
        Long crusadeId,
        Long stateId,
        String stateAbbreviation,
        Long dioceseId,
        String dioceseName,
        Long parishId,
        String parishName,
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