package com.nearchrist.backend.dto;

import java.util.List;

public record DioceseDto(
        Long dioceseId,
        String dioceseName,
        String dioceseStreetNo,
        String dioceseStreetName,
        String dioceseSuburb,
        String diocesePostcode,
        String diocesePhone,
        String dioceseEmail,
        String dioceseWebsite,
        List<String> associatedStateAbbreviations // Computed from parishes' states
) {}