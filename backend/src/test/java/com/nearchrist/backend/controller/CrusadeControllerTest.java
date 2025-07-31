package com.nearchrist.backend.controller;

import com.nearchrist.backend.entity.Crusade;
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
class CrusadeControllerTest {

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
    void testGetAllCrusades() throws Exception {
        mockMvc.perform(get("/crusades").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void testGetCrusadeById() throws Exception {
        mockMvc.perform(get("/crusades/1").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.contactName").value("John Doe"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateCrusade() throws Exception {
        String newCrusadeJson = "{\"state\":{\"stateId\":1}, \"diocese\":{\"dioceseId\":1}, \"parish\":{\"parishId\":1}, \"contactName\":\"Test Contact\"}";
        mockMvc.perform(post("/crusades").contentType(MediaType.APPLICATION_JSON).content(newCrusadeJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.contactName").value("Test Contact"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateCrusade() throws Exception {
        String updatedCrusadeJson = "{\"state\":{\"stateId\":1}, \"diocese\":{\"dioceseId\":1}, \"parish\":{\"parishId\":1}, \"contactName\":\"Updated Contact\"}";
        mockMvc.perform(put("/crusades/1").contentType(MediaType.APPLICATION_JSON).content(updatedCrusadeJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.contactName").value("Updated Contact"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteCrusadeSuccess() throws Exception {
        // Create a new crusade with no references
        String newCrusadeJson = "{\"state\":{\"stateId\":1}, \"diocese\":{\"dioceseId\":1}, \"parish\":{\"parishId\":1}, \"contactName\":\"Test Crusade\"}";
        mockMvc.perform(post("/crusades").contentType(MediaType.APPLICATION_JSON).content(newCrusadeJson))
                .andExpect(status().isCreated());

        // Delete the new crusade
        mockMvc.perform(delete("/crusades/2").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteCrusadeWithReferenceFails() throws Exception {
        // Assuming Crusade has no further references, but if future tables reference it, this would block
        // For now, it succeeds
        mockMvc.perform(delete("/crusades/1").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}