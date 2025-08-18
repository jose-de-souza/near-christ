package com.nearchrist.backend.dto;

public record DioceseUpsertDto(
        String dioceseName,
        String dioceseStreetNo,
        String dioceseStreetName,
        String dioceseSuburb,
        String diocesePostcode,
        String diocesePhone,
        String dioceseEmail,
        String dioceseWebsite
) {}