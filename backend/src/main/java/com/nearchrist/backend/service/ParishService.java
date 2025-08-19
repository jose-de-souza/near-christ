package com.nearchrist.backend.service;

import com.nearchrist.backend.dto.ParishDto;
import com.nearchrist.backend.dto.ParishUpsertDto;
import com.nearchrist.backend.entity.Parish;
import com.nearchrist.backend.mapper.ParishMapper;
import com.nearchrist.backend.repository.DioceseRepository;
import com.nearchrist.backend.repository.ParishRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ParishService {
    private final ParishRepository repository;
    private final DioceseRepository dioceseRepository;
    private final ParishMapper mapper;

    public ParishService(ParishRepository repository, DioceseRepository dioceseRepository, ParishMapper mapper) {
        this.repository = repository;
        this.dioceseRepository = dioceseRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<ParishDto> getAllParishes() {
        return mapper.toDtoList(repository.findAll());
    }

    @Transactional(readOnly = true)
    public Optional<ParishDto> getParishById(Long id) {
        return repository.findById(id).map(mapper::toDto);
    }

    @Transactional
    public ParishDto createParish(ParishUpsertDto dto) {
        if (dto.dioceseId() == null || dto.parishName() == null || dto.stateId() == null) {
            throw new IllegalArgumentException("Diocese ID, Parish Name, and State ID are required");
        }
        if (!dioceseRepository.existsById(dto.dioceseId())) {
            throw new IllegalArgumentException("Diocese with ID " + dto.dioceseId() + " does not exist");
        }
        Parish entity = mapper.toEntity(dto);
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public Optional<ParishDto> updateParish(Long id, ParishUpsertDto dto) {
        if (dto.dioceseId() == null || dto.parishName() == null || dto.stateId() == null) {
            throw new IllegalArgumentException("Diocese ID, Parish Name, and State ID are required");
        }
        if (!dioceseRepository.existsById(dto.dioceseId())) {
            throw new IllegalArgumentException("Diocese with ID " + dto.dioceseId() + " does not exist");
        }
        return repository.findById(id)
                .map(entity -> {
                    Parish updated = mapper.toEntity(dto);
                    updated.setParishId(id);
                    return mapper.toDto(repository.save(updated));
                });
    }

    @Transactional
    public boolean deleteParish(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        try {
            repository.deleteById(id);
            return true;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new IllegalStateException("Cannot delete Parish because it is referenced by other records");
        }
    }
}