package com.nearchrist.backend.dto;

import java.util.Set;

public record UserDto(
        Long id,
        String userName,  // The actual username for display
        String userEmail, // The email, used for login and communication
        String firstName,
        String lastName,
        boolean enabled,
        Set<String> roles
) {}