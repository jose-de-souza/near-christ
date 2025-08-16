package com.nearchrist.backend.mapper;

import com.nearchrist.backend.dto.UserDto;
import com.nearchrist.backend.entity.Role;
import com.nearchrist.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "userFullName", target = "userFullName")
    @Mapping(source = "roles", target = "roles", qualifiedByName = "rolesToRoleNames")
    UserDto toDto(User user);

    @Named("rolesToRoleNames")
    default Set<String> rolesToRoleNames(Set<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return Set.of();
        }
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }
}