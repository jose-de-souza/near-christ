package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.entity.User;
import com.nearchrist.backend.service.UserService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAll() {
        try {
            List<User> users = userService.getAll();
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "All users retrieved successfully", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Failed to fetch users: " + e.getMessage(), null));
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> getById(@PathVariable Long id) {
        try {
            return userService.getById(id)
                    .map(user -> ResponseEntity.ok(new ApiResponse<>(true, 200, "User retrieved successfully", user)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "User not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Failed to fetch user: " + e.getMessage(), null));
        }
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<User>> create(@RequestBody User user) {
        try {
            if (user.getUserEmail() == null || user.getUserPassword() == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, 400, "Missing email or password", null));
            }
            User savedUser = userService.create(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, 201, "User created successfully", savedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Failed to create user: " + e.getMessage(), null));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> update(@PathVariable Long id, @RequestBody User user) {
        try {
            return userService.update(id, user)
                    .map(updatedUser -> ResponseEntity.ok(new ApiResponse<>(true, 200, "User updated successfully", updatedUser)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "User not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Failed to update user: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (!userService.delete(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "User not found", null));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "User deleted successfully", null));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, 400, "Cannot delete User because it is referenced by other records", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Failed to delete user: " + e.getMessage(), null));
        }
    }
}