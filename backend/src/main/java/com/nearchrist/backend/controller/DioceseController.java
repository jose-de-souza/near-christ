package com.nearchrist.backend.controller;

import com.nearchrist.backend.dto.ApiResponse;
import com.nearchrist.backend.entity.Diocese;
import com.nearchrist.backend.repository.DioceseRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class DioceseController {

    private final DioceseRepository dioceseRepository;

    public DioceseController(DioceseRepository dioceseRepository) {
        this.dioceseRepository = dioceseRepository;
    }

    @GetMapping("/dioceses")
    public ResponseEntity<ApiResponse<List<Diocese>>> getAll() {
        try {
            List<Diocese> dioceses = dioceseRepository.findAll();
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "All dioceses fetched", dioceses));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching dioceses: " + e.getMessage(), null));
        }
    }

    @GetMapping("/dioceses/{id}")
    public ResponseEntity<ApiResponse<Diocese>> getById(@PathVariable Long id) {
        try {
            Optional<Diocese> diocese = dioceseRepository.findById(id);
            return diocese.map(d -> ResponseEntity.ok(new ApiResponse<>(true, 200, "Diocese fetched successfully", d)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ApiResponse<>(false, 404, "Diocese not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error fetching diocese: " + e.getMessage(), null));
        }
    }

    @PostMapping("/dioceses")
    public ResponseEntity<ApiResponse<Diocese>> create(@RequestBody Diocese diocese) {
        try {
            if (diocese.getDioceseName() == null || diocese.getState() == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, 400, "Missing required fields: DioceseName or StateID", null));
            }
            Diocese savedDiocese = dioceseRepository.save(diocese);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, 201, "Diocese created successfully", savedDiocese));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error creating diocese: " + e.getMessage(), null));
        }
    }

    @PutMapping("/dioceses/{id}")
    public ResponseEntity<ApiResponse<Diocese>> update(@PathVariable Long id, @RequestBody Diocese updatedDiocese) {
        try {
            Optional<Diocese> optionalDiocese = dioceseRepository.findById(id);
            if (optionalDiocese.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "Diocese not found", null));
            }
            Diocese diocese = optionalDiocese.get();
            diocese.setDioceseName(updatedDiocese.getDioceseName());
            diocese.setState(updatedDiocese.getState());
            diocese.setDioceseStreetNo(updatedDiocese.getDioceseStreetNo());
            diocese.setDioceseStreetName(updatedDiocese.getDioceseStreetName());
            diocese.setDioceseSuburb(updatedDiocese.getDioceseSuburb());
            diocese.setDiocesePostcode(updatedDiocese.getDiocesePostcode());
            diocese.setDiocesePhone(updatedDiocese.getDiocesePhone());
            diocese.setDioceseEmail(updatedDiocese.getDioceseEmail());
            diocese.setDioceseWebsite(updatedDiocese.getDioceseWebsite());
            Diocese savedDiocese = dioceseRepository.save(diocese);
            return ResponseEntity.ok(new ApiResponse<>(true, 200, "Diocese updated successfully", savedDiocese));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error updating diocese: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/dioceses/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (!dioceseRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, 404, "Diocese not found", null));
            }
            dioceseRepository.deleteById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, 204, "Diocese deleted successfully", null));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, 400, "Cannot delete Diocese because it is referenced by other records", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, 500, "Error deleting diocese: " + e.getMessage(), null));
        }
    }
}