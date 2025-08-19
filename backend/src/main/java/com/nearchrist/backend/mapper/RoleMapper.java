package com.nearchrist.backend.mapper;

import com.nearchrist.backend.dto.RoleDto;
import com.nearchrist.backend.dto.RoleUpsertDto;
import com.nearchrist.backend.entity.Role;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleDto toDto(Role role);

    List<RoleDto> toDtoList(List<Role> roles);

    Role toEntity(RoleUpsertDto dto);
}