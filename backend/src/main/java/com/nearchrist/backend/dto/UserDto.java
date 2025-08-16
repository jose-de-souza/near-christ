package com.nearchrist.backend.dto;

import java.util.Set;

/**
 * User Data Transfer Object.
 * This record is an immutable data carrier that decouples the API from the internal
 * JPA User entity. It provides a clean structure for the frontend.
 */
public record UserDto(
        Long id,
        String userName,
        String userEmail,
        boolean enabled,
        Set<String> roles
) {}
