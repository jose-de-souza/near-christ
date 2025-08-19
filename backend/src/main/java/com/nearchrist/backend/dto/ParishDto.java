package com.nearchrist.backend.dto;

public record ParishDto(
        Long parishId,
        String parishName,
        String parishStNumber,
        String parishStName,
        String parishSuburb,
        String parishPostcode,
        String parishPhone,
        String parishEmail,
        String parishWebsite,
        Long dioceseId,
        String dioceseName,
        Long stateId,
        String stateAbbreviation
) {}