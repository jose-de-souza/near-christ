package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.dto.DioceseDto;
import com.nearchrist.backend.dto.DioceseUpsertDto;
import com.nearchrist.backend.service.DioceseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class DioceseController {

    private final DioceseService dioceseService;

    public DioceseController(DioceseService dioceseService) {
        this.dioceseService = dioceseService;
    }

    @GetMapping("/dioceses")
    public ResponseEntity<ApiResponse<List<DioceseDto>>> getAll() {
        try {
            List<DioceseDto> dioceses = dioceseService.getAllDioceses();
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "All dioceses fetched", dioceses));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching dioceses: " + e.getMessage(), null));
        }
    }

    @GetMapping("/dioceses/{id}")
    public ResponseEntity<ApiResponse<DioceseDto>> getById(@PathVariable Long id) {
        try {
            return dioceseService.getDioceseById(id)
                    .map(d -> ResponseEntity.ok(new ApiResponse<>(true, 200, "Diocese fetched successfully", d)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "Diocese not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching diocese: " + e.getMessage(), null));
        }
    }

    @PostMapping("/dioceses")
    public ResponseEntity<ApiResponse<DioceseDto>> create(@RequestBody DioceseUpsertDto dioceseDto) {
        try {
            DioceseDto savedDiocese = dioceseService.createDiocese(dioceseDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, 201, "Diocese created successfully", savedDiocese));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, 400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error creating diocese: " + e.getMessage(), null));
        }
    }

    @PutMapping("/dioceses/{id}")
    public ResponseEntity<ApiResponse<DioceseDto>> update(@PathVariable Long id, @RequestBody DioceseUpsertDto dioceseDto) {
        try {
            return dioceseService.updateDiocese(id, dioceseDto)
                    .map(d -> ResponseEntity.ok(new ApiResponse<>(true, 200, "Diocese updated successfully", d)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "Diocese not found", null)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, 400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error updating diocese: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/dioceses/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (dioceseService.deleteDiocese(id)) {
                return ResponseEntity.ok(new ApiResponse<>(true, 204, "Diocese deleted successfully", null));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, 404, "Diocese not found", null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, 400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error deleting diocese: " + e.getMessage(), null));
        }
    }
}