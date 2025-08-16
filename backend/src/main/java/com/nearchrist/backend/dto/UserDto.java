package com.nearchrist.backend.dto;

import java.util.Set;

public record UserDto(
        Long id,
        String userFullName, // <-- Renamed
        String userEmail,
        boolean enabled,
        Set<String> roles
) {}