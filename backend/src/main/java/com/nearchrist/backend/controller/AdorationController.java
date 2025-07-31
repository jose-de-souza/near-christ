package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.entity.Adoration;
import com.nearchrist.backend.repository.AdorationRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class AdorationController {

    private final AdorationRepository adorationRepository;

    public AdorationController(AdorationRepository adorationRepository) {
        this.adorationRepository = adorationRepository;
    }

    @GetMapping("/adorations")
    public ResponseEntity<ApiResponse<List<Adoration>>> getAll(
            @RequestParam(required = false) Long state_id,
            @RequestParam(required = false) Long diocese_id,
            @RequestParam(required = false) Long parish_id) {
        try {
            List<Adoration> adorations = adorationRepository.findByFilters(state_id, diocese_id, parish_id);
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "All adorations fetched", adorations));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching adorations: " + e.getMessage(), null));
        }
    }

    @GetMapping("/adorations/{id}")
    public ResponseEntity<ApiResponse<Adoration>> getById(@PathVariable Long id) {
        try {
            Optional<Adoration> adoration = adorationRepository.findById(id);
            return adoration.map(a -> ResponseEntity.ok(new ApiResponse<>(true, 200, "Adoration fetched successfully", a)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "Adoration not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching adoration: " + e.getMessage(), null));
        }
    }

    @PostMapping("/adorations")
    public ResponseEntity<ApiResponse<Adoration>> create(@RequestBody Adoration adoration) {
        try {
            if (adoration.getState() == null || adoration.getDiocese() == null || adoration.getParish() == null || adoration.getAdorationType() == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, 400, "Missing required fields: StateID, DioceseID, ParishID, AdorationType", null));
            }
            Adoration savedAdoration = adorationRepository.save(adoration);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, 201, "Adoration created successfully", savedAdoration));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error creating adoration: " + e.getMessage(), null));
        }
    }

    @PutMapping("/adorations/{id}")
    public ResponseEntity<ApiResponse<Adoration>> update(@PathVariable Long id, @RequestBody Adoration updatedAdoration) {
        try {
            Optional<Adoration> optionalAdoration = adorationRepository.findById(id);
            if (optionalAdoration.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "Adoration not found", null));
            }
            Adoration adoration = optionalAdoration.get();
            adoration.setState(updatedAdoration.getState());
            adoration.setDiocese(updatedAdoration.getDiocese());
            adoration.setParish(updatedAdoration.getParish());
            adoration.setAdorationType(updatedAdoration.getAdorationType());
            adoration.setAdorationLocation(updatedAdoration.getAdorationLocation());
            adoration.setAdorationLocationType(updatedAdoration.getAdorationLocationType());
            adoration.setAdorationDay(updatedAdoration.getAdorationDay());
            adoration.setAdorationStart(updatedAdoration.getAdorationStart());
            adoration.setAdorationEnd(updatedAdoration.getAdorationEnd());
            Adoration savedAdoration = adorationRepository.save(adoration);
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "Adoration updated successfully", savedAdoration));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error updating adoration: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/adorations/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (!adorationRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "Adoration not found", null));
            }
            adorationRepository.deleteById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, 204, "Adoration deleted successfully", null));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, 400, "Cannot delete Adoration because it is referenced by other records", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error deleting adoration: " + e.getMessage(), null));
        }
    }
}