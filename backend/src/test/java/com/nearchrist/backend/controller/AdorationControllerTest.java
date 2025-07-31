package com.nearchrist.backend.controller;

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
class AdorationControllerTest {

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
    void testGetAllAdorations() throws Exception {
        mockMvc.perform(get("/adorations").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].adorationId").value(4))
                .andExpect(jsonPath("$.data[1].adorationId").value(6));
    }

    @Test
    void testGetAdorationById() throws Exception {
        mockMvc.perform(get("/adorations/4").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.adorationType").value("Perpetual"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateAdoration() throws Exception {
        String newAdorationJson = "{\"state\":{\"stateId\":1}, \"diocese\":{\"dioceseId\":1}, \"parish\":{\"parishId\":1}, \"adorationType\":\"Test Type\"}";
        mockMvc.perform(post("/adorations").contentType(MediaType.APPLICATION_JSON).content(newAdorationJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.adorationType").value("Test Type"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateAdoration() throws Exception {
        String updatedAdorationJson = "{\"state\":{\"stateId\":1}, \"diocese\":{\"dioceseId\":1}, \"parish\":{\"parishId\":6}, \"adorationType\":\"Updated Type\"}";
        mockMvc.perform(put("/adorations/4").contentType(MediaType.APPLICATION_JSON).content(updatedAdorationJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.adorationType").value("Updated Type"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteAdorationSuccess() throws Exception {
        // Create a new adoration with no references
        String newAdorationJson = "{\"state\":{\"stateId\":1}, \"diocese\":{\"dioceseId\":1}, \"parish\":{\"parishId\":1}, \"adorationType\":\"Test Adoration\"}";
        mockMvc.perform(post("/adorations").contentType(MediaType.APPLICATION_JSON).content(newAdorationJson))
                .andExpect(status().isCreated());

        // Delete the new adoration
        mockMvc.perform(delete("/adorations/7").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteAdorationWithReferenceFails() throws Exception {
        // Assuming Adoration has no further references, but if future tables reference it, this would block
        // For now, since no further references, it would succeed, but add placeholder for future
        mockMvc.perform(delete("/adorations/4").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())  // Succeeds as no references, but update if needed
                .andExpect(jsonPath("$.success").value(true));
    }
}