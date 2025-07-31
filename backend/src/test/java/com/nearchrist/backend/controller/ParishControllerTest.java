package com.nearchrist.backend.controller;

import com.nearchrist.backend.entity.Parish;
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
class ParishControllerTest {

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
    void testGetAllParishes() throws Exception {
        mockMvc.perform(get("/parishes").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(3));
    }

    @Test
    void testGetParishById() throws Exception {
        mockMvc.perform(get("/parishes/1").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.parishName").value("All Hallows"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateParish() throws Exception {
        String newParishJson = "{\"diocese\":{\"dioceseId\":1}, \"parishName\":\"New Parish\", \"state\":{\"stateId\":1}}";
        mockMvc.perform(post("/parishes").contentType(MediaType.APPLICATION_JSON).content(newParishJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.parishName").value("New Parish"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateParish() throws Exception {
        String updatedParishJson = "{\"diocese\":{\"dioceseId\":1}, \"parishName\":\"Updated All Hallows\", \"state\":{\"stateId\":1}}";
        mockMvc.perform(put("/parishes/1").contentType(MediaType.APPLICATION_JSON).content(updatedParishJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.parishName").value("Updated All Hallows"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteParishSuccess() throws Exception {
        // Create a new parish with no references
        String newParishJson = "{\"diocese\":{\"dioceseId\":1}, \"parishName\":\"Test Parish\", \"state\":{\"stateId\":1}}";
        mockMvc.perform(post("/parishes").contentType(MediaType.APPLICATION_JSON).content(newParishJson))
                .andExpect(status().isCreated());

        // Delete the new parish
        mockMvc.perform(delete("/parishes/7").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteParishWithReferenceFails() throws Exception {
        // ParishID 6 is referenced by adorations in test-data.sql
        mockMvc.perform(delete("/parishes/6").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Cannot delete Parish because it is referenced by other records"));
    }
}