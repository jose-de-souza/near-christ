package com.nearchrist.backend.controller;

import com.nearchrist.backend.entity.Diocese;
import com.nearchrist.backend.entity.State;
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
class DioceseControllerTest {

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
    void testGetAllDioceses() throws Exception {
        mockMvc.perform(get("/dioceses").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(3));
    }

    @Test
    void testGetDioceseById() throws Exception {
        mockMvc.perform(get("/dioceses/1").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.dioceseName").value("Sydney Archdiocese"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateDiocese() throws Exception {
        String newDioceseJson = "{\"dioceseName\":\"New Diocese\",\"state\":{\"stateId\":1}}";
        mockMvc.perform(post("/dioceses").contentType(MediaType.APPLICATION_JSON).content(newDioceseJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.dioceseName").value("New Diocese"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateDiocese() throws Exception {
        String updatedDioceseJson = "{\"dioceseName\":\"Updated Sydney Archdiocese\",\"state\":{\"stateId\":1}}";
        mockMvc.perform(put("/dioceses/1").contentType(MediaType.APPLICATION_JSON).content(updatedDioceseJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.dioceseName").value("Updated Sydney Archdiocese"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteDioceseSuccess() throws Exception {
        // Create a new diocese with no references
        String newDioceseJson = "{\"dioceseName\":\"Test Diocese\",\"state\":{\"stateId\":1}}";
        mockMvc.perform(post("/dioceses").contentType(MediaType.APPLICATION_JSON).content(newDioceseJson))
                .andExpect(status().isCreated());

        // Delete the new diocese
        mockMvc.perform(delete("/dioceses/4").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteDioceseWithReferenceFails() throws Exception {
        // DioceseID 1 is referenced by parishes in test-data.sql
        mockMvc.perform(delete("/dioceses/1").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Cannot delete Diocese because it is referenced by other records"));
    }
}