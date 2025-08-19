package com.nearchrist.backend.service;

import com.nearchrist.backend.dto.StateDto;
import com.nearchrist.backend.dto.StateUpsertDto;
import com.nearchrist.backend.entity.State;
import com.nearchrist.backend.mapper.StateMapper;
import com.nearchrist.backend.repository.StateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StateService {
    private final StateRepository repository;
    private final StateMapper mapper;

    public StateService(StateRepository repository, StateMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<StateDto> getAllStates() {
        return mapper.toDtoList(repository.findAll());
    }

    @Transactional(readOnly = true)
    public Optional<StateDto> getStateById(Long id) {
        return repository.findById(id).map(mapper::toDto);
    }

    @Transactional
    public StateDto createState(StateUpsertDto dto) {
        if (dto.stateName() == null || dto.stateName().isEmpty()) {
            throw new IllegalArgumentException("State name is required");
        }
        State entity = mapper.toEntity(dto);
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public Optional<StateDto> updateState(Long id, StateUpsertDto dto) {
        if (dto.stateName() == null || dto.stateName().isEmpty()) {
            throw new IllegalArgumentException("State name is required");
        }
        return repository.findById(id)
                .map(entity -> {
                    State updated = mapper.toEntity(dto);
                    updated.setStateId(id);
                    return mapper.toDto(repository.save(updated));
                });
    }

    @Transactional
    public boolean deleteState(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        try {
            repository.deleteById(id);
            return true;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new IllegalStateException("Cannot delete State because it is referenced by other records");
        }
    }
}