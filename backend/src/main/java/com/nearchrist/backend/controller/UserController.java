package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.dto.UserDto;
import com.nearchrist.backend.dto.UserUpsertDto; // A new DTO for create/update operations
import com.nearchrist.backend.service.UserService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users") // It's good practice to have a base path for the controller
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAll() {
        try {
            // The service now returns a list of UserDto
            List<UserDto> users = userService.getAllUsers();
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "All users retrieved successfully", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Failed to fetch users: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getById(@PathVariable Long id) {
        try {
            // The service now returns an Optional of UserDto
            return userService.getUserById(id)
                    .map(userDto -> ResponseEntity.ok(new ApiResponse<>(true, 200, "User retrieved successfully", userDto)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "User not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Failed to fetch user: " + e.getMessage(), null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> create(@RequestBody UserUpsertDto userDto) {
        try {
            if (userDto.userEmail() == null || userDto.password() == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, 400, "Missing email or password", null));
            }
            // The service now accepts a DTO for user creation
            UserDto savedUser = userService.createUser(userDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, 201, "User created successfully", savedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Failed to create user: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> update(@PathVariable Long id, @RequestBody UserUpsertDto userDto) {
        try {
            // The service now accepts a DTO for user updates
            return userService.updateUser(id, userDto)
                    .map(updatedUser -> ResponseEntity.ok(new ApiResponse<>(true, 200, "User updated successfully", updatedUser)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "User not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Failed to update user: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (!userService.deleteUser(id)) {
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
