package com.nearchrist.backend.controller;

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
class StateControllerTest {

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
    void testGetAllStates() throws Exception {
        mockMvc.perform(get("/states").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    void testGetStateById() throws Exception {
        mockMvc.perform(get("/states/1").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.stateName").value("New South Wales"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateState() throws Exception {
        String newStateJson = "{\"stateName\":\"Tasmania\",\"stateAbbreviation\":\"TAS\"}";
        mockMvc.perform(post("/states").contentType(MediaType.APPLICATION_JSON).content(newStateJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.stateName").value("Tasmania"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateState() throws Exception {
        String updatedStateJson = "{\"stateName\":\"Updated New South Wales\",\"stateAbbreviation\":\"NSW\"}";
        mockMvc.perform(put("/states/1").contentType(MediaType.APPLICATION_JSON).content(updatedStateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.stateName").value("Updated New South Wales"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteStateSuccess() throws Exception {
        // Assuming a state with no references (e.g., add a test state first if needed; in test-data.sql, state 2 has reference from diocese 2)
        String newStateJson = "{\"stateName\":\"Test State\",\"stateAbbreviation\":\"TS\"}";
        mockMvc.perform(post("/states").contentType(MediaType.APPLICATION_JSON).content(newStateJson))
                .andExpect(status().isCreated());

        // Delete the new state
        mockMvc.perform(delete("/states/3").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteStateWithReferenceFails() throws Exception {
        // StateID 1 is referenced by multiple records in test-data.sql
        mockMvc.perform(delete("/states/1").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Cannot delete State because it is referenced by other records"));
    }
}