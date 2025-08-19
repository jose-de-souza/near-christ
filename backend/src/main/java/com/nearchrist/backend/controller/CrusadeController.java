package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.CrusadeDto;
import com.nearchrist.backend.dto.CrusadeUpsertDto;
import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.service.CrusadeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/crusades")
public class CrusadeController {
    private final CrusadeService service;

    public CrusadeController(CrusadeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CrusadeDto>>> getAll(
            @RequestParam(required = false) Long state_id,
            @RequestParam(required = false) Long diocese_id,
            @RequestParam(required = false) Long parish_id) {
        try {
            List<CrusadeDto> crusades = service.getAllCrusades();
            if (state_id != null) {
                crusades = crusades.stream().filter(c -> state_id.equals(c.stateId())).toList();
            }
            if (diocese_id != null) {
                crusades = crusades.stream().filter(c -> diocese_id.equals(c.dioceseId())).toList();
            }
            if (parish_id != null) {
                crusades = crusades.stream().filter(c -> parish_id.equals(c.parishId())).toList();
            }
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "All crusades fetched", crusades));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching crusades: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CrusadeDto>> getById(@PathVariable Long id) {
        try {
            return service.getCrusadeById(id)
                    .map(c -> ResponseEntity.ok(new ApiResponse<>(true, 200, "Crusade fetched successfully", c)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "Crusade not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching crusade: " + e.getMessage(), null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CrusadeDto>> create(@RequestBody CrusadeUpsertDto dto) {
        try {
            CrusadeDto saved = service.createCrusade(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, 201, "Crusade created successfully", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, 400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error creating crusade: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CrusadeDto>> update(@PathVariable Long id, @RequestBody CrusadeUpsertDto dto) {
        try {
            return service.updateCrusade(id, dto)
                    .map(c -> ResponseEntity.ok(new ApiResponse<>(true, 200, "Crusade updated successfully", c)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "Crusade not found", null)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, 400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error updating crusade: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (!service.deleteCrusade(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "Crusade not found", null));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, 204, "Crusade deleted successfully", null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, 400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error deleting crusade: " + e.getMessage(), null));
        }
    }
}