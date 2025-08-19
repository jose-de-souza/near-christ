package com.nearchrist.backend.service;

import com.nearchrist.backend.dto.CrusadeDto;
import com.nearchrist.backend.dto.CrusadeUpsertDto;
import com.nearchrist.backend.entity.Crusade;
import com.nearchrist.backend.mapper.CrusadeMapper;
import com.nearchrist.backend.repository.CrusadeRepository;
import com.nearchrist.backend.repository.DioceseRepository;
import com.nearchrist.backend.repository.ParishRepository;
import com.nearchrist.backend.repository.StateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CrusadeService {
    private final CrusadeRepository repository;
    private final DioceseRepository dioceseRepository;
    private final ParishRepository parishRepository;
    private final StateRepository stateRepository;
    private final CrusadeMapper mapper;

    public CrusadeService(CrusadeRepository repository, DioceseRepository dioceseRepository, ParishRepository parishRepository, StateRepository stateRepository, CrusadeMapper mapper) {
        this.repository = repository;
        this.dioceseRepository = dioceseRepository;
        this.parishRepository = parishRepository;
        this.stateRepository = stateRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<CrusadeDto> getAllCrusades() {
        return mapper.toDtoList(repository.findAll());
    }

    @Transactional(readOnly = true)
    public Optional<CrusadeDto> getCrusadeById(Long id) {
        return repository.findById(id).map(mapper::toDto);
    }

    @Transactional
    public CrusadeDto createCrusade(CrusadeUpsertDto dto) {
        if (dto.dioceseId() == null || dto.parishId() == null || dto.stateId() == null) {
            throw new IllegalArgumentException("State ID, Diocese ID, and Parish ID are required");
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
        Crusade entity = mapper.toEntity(dto);
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public Optional<CrusadeDto> updateCrusade(Long id, CrusadeUpsertDto dto) {
        if (dto.dioceseId() == null || dto.parishId() == null || dto.stateId() == null) {
            throw new IllegalArgumentException("State ID, Diocese ID, and Parish ID are required");
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
                    Crusade updated = mapper.toEntity(dto);
                    updated.setCrusadeId(id);
                    return mapper.toDto(repository.save(updated));
                });
    }

    @Transactional
    public boolean deleteCrusade(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        try {
            repository.deleteById(id);
            return true;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new IllegalStateException("Cannot delete Crusade because it is referenced by other records");
        }
    }
}