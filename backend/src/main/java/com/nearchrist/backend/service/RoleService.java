package com.nearchrist.backend.service;

import com.nearchrist.backend.dto.RoleDto;
import com.nearchrist.backend.dto.RoleUpsertDto;
import com.nearchrist.backend.entity.Role;
import com.nearchrist.backend.mapper.RoleMapper;
import com.nearchrist.backend.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {
    private final RoleRepository repository;
    private final RoleMapper mapper;

    public RoleService(RoleRepository repository, RoleMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return mapper.toDtoList(repository.findAll());
    }

    @Transactional(readOnly = true)
    public Optional<RoleDto> getRoleById(Long id) {
        return repository.findById(id).map(mapper::toDto);
    }

    @Transactional
    public RoleDto createRole(RoleUpsertDto dto) {
        if (dto.name() == null || dto.name().isEmpty()) {
            throw new IllegalArgumentException("Role name is required");
        }
        Role entity = mapper.toEntity(dto);
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public Optional<RoleDto> updateRole(Long id, RoleUpsertDto dto) {
        if (dto.name() == null || dto.name().isEmpty()) {
            throw new IllegalArgumentException("Role name is required");
        }
        return repository.findById(id)
                .map(entity -> {
                    Role updated = mapper.toEntity(dto);
                    updated.setId(id);
                    return mapper.toDto(repository.save(updated));
                });
    }

    @Transactional
    public boolean deleteRole(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        try {
            repository.deleteById(id);
            return true;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new IllegalStateException("Cannot delete Role because it is referenced by other records");
        }
    }
}