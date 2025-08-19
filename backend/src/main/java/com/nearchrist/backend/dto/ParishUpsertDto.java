package com.nearchrist.backend.dto;

public record ParishUpsertDto(
        String parishName,
        String parishStNumber,
        String parishStName,
        String parishSuburb,
        String parishPostcode,
        String parishPhone,
        String parishEmail,
        String parishWebsite,
        Long dioceseId,
        Long stateId
) {}