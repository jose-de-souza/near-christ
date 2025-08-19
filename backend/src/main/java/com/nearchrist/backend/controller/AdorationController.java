package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.AdorationDto;
import com.nearchrist.backend.dto.AdorationUpsertDto;
import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.service.AdorationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/adorations")
public class AdorationController {
    private final AdorationService service;

    public AdorationController(AdorationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdorationDto>>> getAll(
            @RequestParam(required = false) Long state_id,
            @RequestParam(required = false) Long diocese_id,
            @RequestParam(required = false) Long parish_id) {
        try {
            List<AdorationDto> adorations = service.getAllAdorations();
            if (state_id != null) {
                adorations = adorations.stream().filter(a -> state_id.equals(a.stateId())).toList();
            }
            if (diocese_id != null) {
                adorations = adorations.stream().filter(a -> diocese_id.equals(a.dioceseId())).toList();
            }
            if (parish_id != null) {
                adorations = adorations.stream().filter(a -> parish_id.equals(a.parishId())).toList();
            }
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "All adorations fetched", adorations));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching adorations: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdorationDto>> getById(@PathVariable Long id) {
        try {
            return service.getAdorationById(id)
                    .map(a -> ResponseEntity.ok(new ApiResponse<>(true, 200, "Adoration fetched successfully", a)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "Adoration not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching adoration: " + e.getMessage(), null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdorationDto>> create(@RequestBody AdorationUpsertDto dto) {
        try {
            AdorationDto saved = service.createAdoration(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, 201, "Adoration created successfully", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, 400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error creating adoration: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdorationDto>> update(@PathVariable Long id, @RequestBody AdorationUpsertDto dto) {
        try {
            return service.updateAdoration(id, dto)
                    .map(a -> ResponseEntity.ok(new ApiResponse<>(true, 200, "Adoration updated successfully", a)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "Adoration not found", null)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, 400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error updating adoration: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (!service.deleteAdoration(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "Adoration not found", null));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, 204, "Adoration deleted successfully", null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, 400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error deleting adoration: " + e.getMessage(), null));
        }
    }
}