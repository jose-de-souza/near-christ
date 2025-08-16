package com.nearchrist.backend.dto;

import java.util.Set;

/**
 * DTO for creating and updating users (Upsert).
 * The password is optional for updates where it's not being changed.
 */
public record UserUpsertDto(
        String userName,
        String userEmail,
        String password, // Can be null on update
        Set<String> roles
) {}
