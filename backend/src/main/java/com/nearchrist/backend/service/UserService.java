package com.nearchrist.backend.service;

import com.nearchrist.backend.entity.User;
import com.nearchrist.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public Optional<User> getById(Long id) {
        return userRepository.findById(id);
    }

    public User create(User user) {
        if (user.getUserPassword() != null && !user.getUserPassword().startsWith("$2a$") && !user.getUserPassword().startsWith("$2y$")) {
            user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        }
        return userRepository.save(user);
    }

    public Optional<User> update(Long id, User updatedUser) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setUserName(updatedUser.getUsername());
            user.setUserEmail(updatedUser.getUserEmail());
            user.setUserRole(updatedUser.getUserRole());
            if (updatedUser.getUserPassword() != null && !updatedUser.getUserPassword().startsWith("$2a$") && !updatedUser.getUserPassword().startsWith("$2y$")) {
                user.setUserPassword(passwordEncoder.encode(updatedUser.getUserPassword()));
            }
            return Optional.of(userRepository.save(user));
        }
        return Optional.empty();
    }

    public boolean delete(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }
}