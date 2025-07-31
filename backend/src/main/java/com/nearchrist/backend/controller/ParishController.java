package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.entity.Parish;
import com.nearchrist.backend.repository.ParishRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class ParishController {

    private final ParishRepository parishRepository;

    public ParishController(ParishRepository parishRepository) {
        this.parishRepository = parishRepository;
    }

    @GetMapping("/parishes")
    public ResponseEntity<ApiResponse<List<Parish>>> getAll() {
        try {
            List<Parish> parishes = parishRepository.findAll();
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "All parishes fetched", parishes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching parishes: " + e.getMessage(), null));
        }
    }

    @GetMapping("/parishes/{id}")
    public ResponseEntity<ApiResponse<Parish>> getById(@PathVariable Long id) {
        try {
            Optional<Parish> parish = parishRepository.findById(id);
            return parish.map(p -> ResponseEntity.ok(new ApiResponse<>(true, 200, "Parish fetched successfully", p)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "Parish not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching parish: " + e.getMessage(), null));
        }
    }

    @PostMapping("/parishes")
    public ResponseEntity<ApiResponse<Parish>> create(@RequestBody Parish parish) {
        try {
            if (parish.getDiocese() == null || parish.getParishName() == null || parish.getState() == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, 400, "Missing one or more required fields: DioceseID, ParishName, StateID", null));
            }
            Parish savedParish = parishRepository.save(parish);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, 201, "Parish created successfully", savedParish));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error creating parish: " + e.getMessage(), null));
        }
    }

    @PutMapping("/parishes/{id}")
    public ResponseEntity<ApiResponse<Parish>> update(@PathVariable Long id, @RequestBody Parish updatedParish) {
        try {
            Optional<Parish> optionalParish = parishRepository.findById(id);
            if (optionalParish.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "Parish not found", null));
            }
            Parish parish = optionalParish.get();
            parish.setDiocese(updatedParish.getDiocese());
            parish.setParishName(updatedParish.getParishName());
            parish.setState(updatedParish.getState());
            parish.setParishStNumber(updatedParish.getParishStNumber());
            parish.setParishStName(updatedParish.getParishStName());
            parish.setParishSuburb(updatedParish.getParishSuburb());
            parish.setParishPostcode(updatedParish.getParishPostcode());
            parish.setParishPhone(updatedParish.getParishPhone());
            parish.setParishEmail(updatedParish.getParishEmail());
            parish.setParishWebsite(updatedParish.getParishWebsite());
            Parish savedParish = parishRepository.save(parish);
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "Parish updated successfully", savedParish));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error updating parish: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/parishes/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (!parishRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "Parish not found", null));
            }
            parishRepository.deleteById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, 204, "Parish deleted successfully", null));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, 400, "Cannot delete Parish because it is referenced by other records", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error deleting parish: " + e.getMessage(), null));
        }
    }
}