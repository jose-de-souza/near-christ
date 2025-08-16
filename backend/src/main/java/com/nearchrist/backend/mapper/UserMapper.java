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

    @Mapping(source = "id", target = "id")
    // The source property in the User entity is "username" (lowercase n).
    @Mapping(source = "username", target = "userName")
    @Mapping(source = "userEmail", target = "userEmail")
    @Mapping(source = "enabled", target = "enabled")
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
