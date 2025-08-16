package com.nearchrist.backend.service;

import com.nearchrist.backend.dto.UserDto;
import com.nearchrist.backend.dto.UserUpsertDto;
import com.nearchrist.backend.entity.Role;
import com.nearchrist.backend.entity.User;
import com.nearchrist.backend.mapper.UserMapper;
import com.nearchrist.backend.repository.RoleRepository;
import com.nearchrist.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> getUserById(Long id) {
        return userRepository.findById(id).map(userMapper::toDto);
    }

    @Transactional
    public UserDto createUser(UserUpsertDto userDto) {
        User user = new User();
        // --- THIS IS THE FIX ---
        // Use the correct setter 'setUsername' to match the 'username' field in the User entity.
        user.setUsername(userDto.userName());
        user.setUserEmail(userDto.userEmail());
        user.setPassword(passwordEncoder.encode(userDto.password()));

        Set<Role> roles = userDto.roles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
                .collect(Collectors.toSet());
        user.setRoles(roles);

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Transactional
    public Optional<UserDto> updateUser(Long id, UserUpsertDto userDto) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    // --- THIS IS THE FIX ---
                    // Use the correct setter 'setUsername' here as well.
                    existingUser.setUsername(userDto.userName());
                    existingUser.setUserEmail(userDto.userEmail());

                    // Only update password if a new one is provided
                    if (userDto.password() != null && !userDto.password().isEmpty()) {
                        existingUser.setPassword(passwordEncoder.encode(userDto.password()));
                    }

                    if (userDto.roles() != null) {
                        Set<Role> roles = userDto.roles().stream()
                                .map(roleName -> roleRepository.findByName(roleName)
                                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
                                .collect(Collectors.toSet());
                        existingUser.setRoles(roles);
                    }

                    User updatedUser = userRepository.save(existingUser);
                    return userMapper.toDto(updatedUser);
                });
    }

    @Transactional
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
