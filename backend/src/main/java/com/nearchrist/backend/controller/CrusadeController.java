package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.entity.Crusade;
import com.nearchrist.backend.repository.CrusadeRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class CrusadeController {

    private final CrusadeRepository crusadeRepository;

    public CrusadeController(CrusadeRepository crusadeRepository) {
        this.crusadeRepository = crusadeRepository;
    }

    @GetMapping("/crusades")
    public ResponseEntity<ApiResponse<List<Crusade>>> getAll(
            @RequestParam(required = false) Long state_id,
            @RequestParam(required = false) Long diocese_id,
            @RequestParam(required = false) Long parish_id) {
        try {
            List<Crusade> crusades = crusadeRepository.findByFilters(state_id, diocese_id, parish_id);
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "All crusades fetched", crusades));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching crusades: " + e.getMessage(), null));
        }
    }

    @GetMapping("/crusades/{id}")
    public ResponseEntity<ApiResponse<Crusade>> getById(@PathVariable Long id) {
        try {
            Optional<Crusade> crusade = crusadeRepository.findById(id);
            return crusade.map(c -> ResponseEntity.ok(new ApiResponse<>(true, 200, "Crusade fetched successfully", c)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "Crusade not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching crusade: " + e.getMessage(), null));
        }
    }

    @PostMapping("/crusades")
    public ResponseEntity<ApiResponse<Crusade>> create(@RequestBody Crusade crusade) {
        try {
            if (crusade.getState() == null || crusade.getDiocese() == null || crusade.getParish() == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, 400, "Missing required fields: StateID, DioceseID, ParishID", null));
            }
            Crusade savedCrusade = crusadeRepository.save(crusade);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, 201, "Crusade created successfully", savedCrusade));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error creating crusade: " + e.getMessage(), null));
        }
    }

    @PutMapping("/crusades/{id}")
    public ResponseEntity<ApiResponse<Crusade>> update(@PathVariable Long id, @RequestBody Crusade updatedCrusade) {
        try {
            Optional<Crusade> optionalCrusade = crusadeRepository.findById(id);
            if (optionalCrusade.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "Crusade not found", null));
            }
            Crusade crusade = optionalCrusade.get();
            crusade.setState(updatedCrusade.getState());
            crusade.setDiocese(updatedCrusade.getDiocese());
            crusade.setParish(updatedCrusade.getParish());
            crusade.setConfessionStartTime(updatedCrusade.getConfessionStartTime());
            crusade.setConfessionEndTime(updatedCrusade.getConfessionEndTime());
            crusade.setMassStartTime(updatedCrusade.getMassStartTime());
            crusade.setMassEndTime(updatedCrusade.getMassEndTime());
            crusade.setCrusadeStartTime(updatedCrusade.getCrusadeStartTime());
            crusade.setCrusadeEndTime(updatedCrusade.getCrusadeEndTime());
            crusade.setContactName(updatedCrusade.getContactName());
            crusade.setContactPhone(updatedCrusade.getContactPhone());
            crusade.setContactEmail(updatedCrusade.getContactEmail());
            crusade.setComments(updatedCrusade.getComments());
            Crusade savedCrusade = crusadeRepository.save(crusade);
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "Crusade updated successfully", savedCrusade));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error updating crusade: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/crusades/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (!crusadeRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "Crusade not found", null));
            }
            crusadeRepository.deleteById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, 204, "Crusade deleted successfully", null));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, 400, "Cannot delete Crusade because it is referenced by other records", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error deleting crusade: " + e.getMessage(), null));
        }
    }
}