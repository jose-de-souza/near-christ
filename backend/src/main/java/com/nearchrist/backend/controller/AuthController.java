package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.dto.LoginRequest;
import com.nearchrist.backend.entity.User;
import com.nearchrist.backend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

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
            String jwt = jwtUtil.generateToken((User) authentication.getPrincipal());

            User user = (User) authentication.getPrincipal();
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("accessToken", jwt);
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getUserId());
            userInfo.put("name", user.getUsername());
            userInfo.put("email", user.getUserEmail());
            userInfo.put("role", user.getUserRole());
            responseData.put("user", userInfo);

            return ResponseEntity.ok(new ApiResponse<>(true, 200, "Login successful", responseData));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, 401, "Invalid credentials", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Login failed", null));
        }
    }
}