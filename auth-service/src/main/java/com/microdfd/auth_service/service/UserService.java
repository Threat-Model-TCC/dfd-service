package com.microdfd.auth_service.service;

import com.microdfd.auth_service.dto.RegisterUserDTO;
import com.microdfd.auth_service.entity.User;
import com.microdfd.auth_service.exception.ObjectNotFoundException;
import com.microdfd.auth_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void registerUser(RegisterUserDTO dto) {
        validateUserConflictByMail(dto.mail());

        String passwordHash = passwordEncoder.encode(dto.password());

        User user = new User(dto.name(), dto.mail(), passwordHash);
        userRepository.save(user);
    }

    @Transactional
    public User findOrCreateGoogleUser(String mail, String name, String googleSub) {
        String randomPasswordHash = passwordEncoder.encode(UUID.randomUUID().toString());
        return userRepository.findByMail(mail)
                .map(existing -> linkGoogleAccountIfNeeded(existing, googleSub))
                .orElseGet(() -> userRepository.save(new User(name, mail, googleSub, randomPasswordHash)));
    }

    private User linkGoogleAccountIfNeeded(User user, String googleSub) {
        if (user.isGoogleAccountLinked()) {
            user.linkGoogleAccount(googleSub);
            userRepository.save(user);
        }
        return user;
    }

    public User findByMail(String mail) {
        return userRepository.findByMail(mail)
                .orElseThrow(() -> new ObjectNotFoundException("User with mail " + mail + " not found."));
    }

    public void validateUserConflictByMail(String mail) {
        boolean hasMailRegistered = userRepository.existsByMail(mail);
        if (hasMailRegistered) {
            throw new RuntimeException("User with mail " + mail + " already exists.");
        }
    }
}
