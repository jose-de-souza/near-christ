package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.entity.State;
import com.nearchrist.backend.repository.StateRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class StateController {

    private final StateRepository stateRepository;

    public StateController(StateRepository stateRepository) {
        this.stateRepository = stateRepository;
    }

    @GetMapping("/states")
    public ResponseEntity<ApiResponse<List<State>>> getAll() {
        try {
            List<State> states = stateRepository.findAll();
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "All states fetched", states));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching states: " + e.getMessage(), null));
        }
    }

    @GetMapping("/states/{id}")
    public ResponseEntity<ApiResponse<State>> getById(@PathVariable Long id) {
        try {
            Optional<State> state = stateRepository.findById(id);
            return state.map(s -> ResponseEntity.ok(new ApiResponse<>(true, 200, "State fetched successfully", s)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "State not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching state: " + e.getMessage(), null));
        }
    }

    @PostMapping("/states")
    public ResponseEntity<ApiResponse<State>> create(@RequestBody State state) {
        try {
            if (state.getStateName() == null || state.getStateName().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, 400, "Missing required field: StateName", null));
            }
            State savedState = stateRepository.save(state);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, 201, "State created successfully", savedState));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error creating state: " + e.getMessage(), null));
        }
    }

    @PutMapping("/states/{id}")
    public ResponseEntity<ApiResponse<State>> update(@PathVariable Long id, @RequestBody State updatedState) {
        try {
            Optional<State> optionalState = stateRepository.findById(id);
            if (optionalState.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "State not found", null));
            }
            State state = optionalState.get();
            state.setStateName(updatedState.getStateName());
            state.setStateAbbreviation(updatedState.getStateAbbreviation());
            State savedState = stateRepository.save(state);
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "State updated successfully", savedState));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error updating state: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/states/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (!stateRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "State not found", null));
            }
            stateRepository.deleteById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, 204, "State deleted successfully", null));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, 400, "Cannot delete State because it is referenced by other records", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error deleting state: " + e.getMessage(), null));
        }
    }
}