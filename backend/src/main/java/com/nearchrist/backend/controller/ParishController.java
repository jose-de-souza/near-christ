package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.ParishDto;
import com.nearchrist.backend.dto.ParishUpsertDto;
import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.service.ParishService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/parishes")
public class ParishController {
    private final ParishService service;

    public ParishController(ParishService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ParishDto>>> getAll() {
        try {
            List<ParishDto> parishes = service.getAllParishes();
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "All parishes fetched", parishes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching parishes: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ParishDto>> getById(@PathVariable Long id) {
        try {
            return service.getParishById(id)
                    .map(p -> ResponseEntity.ok(new ApiResponse<>(true, 200, "Parish fetched successfully", p)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "Parish not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching parish: " + e.getMessage(), null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ParishDto>> create(@RequestBody ParishUpsertDto dto) {
        try {
            ParishDto saved = service.createParish(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, 201, "Parish created successfully", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, 400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error creating parish: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ParishDto>> update(@PathVariable Long id, @RequestBody ParishUpsertDto dto) {
        try {
            return service.updateParish(id, dto)
                    .map(p -> ResponseEntity.ok(new ApiResponse<>(true, 200, "Parish updated successfully", p)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "Parish not found", null)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, 400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error updating parish: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (!service.deleteParish(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "Parish not found", null));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, 204, "Parish deleted successfully", null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, 400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error deleting parish: " + e.getMessage(), null));
        }
    }
}