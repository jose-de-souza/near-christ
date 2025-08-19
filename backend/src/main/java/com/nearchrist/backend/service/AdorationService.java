package com.nearchrist.backend.service;

import com.nearchrist.backend.dto.AdorationDto;
import com.nearchrist.backend.dto.AdorationUpsertDto;
import com.nearchrist.backend.entity.Adoration;
import com.nearchrist.backend.mapper.AdorationMapper;
import com.nearchrist.backend.repository.AdorationRepository;
import com.nearchrist.backend.repository.DioceseRepository;
import com.nearchrist.backend.repository.ParishRepository;
import com.nearchrist.backend.repository.StateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdorationService {
    private final AdorationRepository repository;
    private final DioceseRepository dioceseRepository;
    private final ParishRepository parishRepository;
    private final StateRepository stateRepository;
    private final AdorationMapper mapper;

    public AdorationService(AdorationRepository repository, DioceseRepository dioceseRepository, ParishRepository parishRepository, StateRepository stateRepository, AdorationMapper mapper) {
        this.repository = repository;
        this.dioceseRepository = dioceseRepository;
        this.parishRepository = parishRepository;
        this.stateRepository = stateRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<AdorationDto> getAllAdorations() {
        return mapper.toDtoList(repository.findAll());
    }

    @Transactional(readOnly = true)
    public Optional<AdorationDto> getAdorationById(Long id) {
        return repository.findById(id).map(mapper::toDto);
    }

    @Transactional
    public AdorationDto createAdoration(AdorationUpsertDto dto) {
        if (dto.dioceseId() == null || dto.parishId() == null || dto.stateId() == null || dto.adorationType() == null) {
            throw new IllegalArgumentException("State ID, Diocese ID, Parish ID, and Adoration Type are required");
        }
        if (!dioceseRepository.existsById(dto.dioceseId())) {
            throw new IllegalArgumentException("Diocese with ID " + dto.dioceseId() + " does not exist");
        }
        if (!parishRepository.existsById(dto.parishId())) {
            throw new IllegalArgumentException("Parish with ID " + dto.parishId() + " does not exist");
        }
        if (!stateRepository.existsById(dto.stateId())) {
            throw new IllegalArgumentException("State with ID " + dto.stateId() + " does not exist");
        }
        Adoration entity = mapper.toEntity(dto);
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public Optional<AdorationDto> updateAdoration(Long id, AdorationUpsertDto dto) {
        if (dto.dioceseId() == null || dto.parishId() == null || dto.stateId() == null || dto.adorationType() == null) {
            throw new IllegalArgumentException("State ID, Diocese ID, Parish ID, and Adoration Type are required");
        }
        if (!dioceseRepository.existsById(dto.dioceseId())) {
            throw new IllegalArgumentException("Diocese with ID " + dto.dioceseId() + " does not exist");
        }
        if (!parishRepository.existsById(dto.parishId())) {
            throw new IllegalArgumentException("Parish with ID " + dto.parishId() + " does not exist");
        }
        if (!stateRepository.existsById(dto.stateId())) {
            throw new IllegalArgumentException("State with ID " + dto.stateId() + " does not exist");
        }
        return repository.findById(id)
                .map(entity -> {
                    Adoration updated = mapper.toEntity(dto);
                    updated.setAdorationId(id);
                    return mapper.toDto(repository.save(updated));
                });
    }

    @Transactional
    public boolean deleteAdoration(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        try {
            repository.deleteById(id);
            return true;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new IllegalStateException("Cannot delete Adoration because it is referenced by other records");
        }
    }
}