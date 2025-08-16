package com.nearchrist.backend.dto;

import java.util.Set;

public record UserUpsertDto(
        String userFullName, // <-- Renamed
        String userEmail,
        String password,
        Set<String> roles
) {}