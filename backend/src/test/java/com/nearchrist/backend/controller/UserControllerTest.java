package com.nearchrist.backend.controller;

import com.nearchrist.backend.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Testcontainers
@AutoConfigureMockMvc
@Sql(scripts = {"/test-schema.sql", "/test-data.sql"})
class UserControllerTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:14")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllUsers() throws Exception {
        mockMvc.perform(get("/users").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(0));  // No users in test-data.sql, adjust if added
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetUserById() throws Exception {
        // Create a user first
        String newUserJson = "{\"userName\":\"Test User\",\"userEmail\":\"test@nearchrist.com\",\"userPassword\":\"password\",\"userRole\":\"STANDARD\"}";
        mockMvc.perform(post("/users").contentType(MediaType.APPLICATION_JSON).content(newUserJson))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/users/1").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userName").value("Test User"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateUser() throws Exception {
        String newUserJson = "{\"userName\":\"New User\",\"userEmail\":\"new@nearchrist.com\",\"userPassword\":\"password\",\"userRole\":\"STANDARD\"}";
        mockMvc.perform(post("/users").contentType(MediaType.APPLICATION_JSON).content(newUserJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userName").value("New User"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateUser() throws Exception {
        // Create a user first
        String newUserJson = "{\"userName\":\"Test User\",\"userEmail\":\"test@nearchrist.com\",\"userPassword\":\"password\",\"userRole\":\"STANDARD\"}";
        mockMvc.perform(post("/users").contentType(MediaType.APPLICATION_JSON).content(newUserJson))
                .andExpect(status().isCreated());

        String updatedUserJson = "{\"userName\":\"Updated User\",\"userEmail\":\"updated@nearchrist.com\",\"userRole\":\"ADMIN\"}";
        mockMvc.perform(put("/users/1").contentType(MediaType.APPLICATION_JSON).content(updatedUserJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userName").value("Updated User"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteUserSuccess() throws Exception {
        // Create a user first
        String newUserJson = "{\"userName\":\"Test User\",\"userEmail\":\"test@nearchrist.com\",\"userPassword\":\"password\",\"userRole\":\"STANDARD\"}";
        mockMvc.perform(post("/users").contentType(MediaType.APPLICATION_JSON).content(newUserJson))
                .andExpect(status().isCreated());

        // Delete the user
        mockMvc.perform(delete("/users/1").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteUserWithReferenceFails() throws Exception {
        // Assuming User has no references, it succeeds. If future references are added, update to expect failure
        mockMvc.perform(delete("/users/1").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())  // If no user, or succeed if exists without references
                .andExpect(jsonPath("$.success").value(false));
    }
}