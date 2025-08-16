package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.dto.LoginRequest;
import com.nearchrist.backend.entity.Role;
import com.nearchrist.backend.entity.User;
import com.nearchrist.backend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // --- UPDATED ---
            // generateToken now correctly accepts the UserDetails principal
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(userDetails);

            // --- UPDATED ---
            // Build the response payload with the correct fields from the User entity
            User user = (User) authentication.getPrincipal();
            List<String> roles = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId()); // Use getId()
            userInfo.put("name", user.getUsername()); // Use getUserName() for the display name
            userInfo.put("email", user.getUserEmail());
            userInfo.put("roles", roles); // Pass the list of role names

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("accessToken", jwt);
            responseData.put("user", userInfo);

            return ResponseEntity.ok(new ApiResponse<>(true, 200, "Login successful", responseData));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, 401, "Invalid credentials", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Login failed: " + e.getMessage(), null));
        }
    }
}
