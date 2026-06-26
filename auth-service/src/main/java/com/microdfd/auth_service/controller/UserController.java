package com.microdfd.auth_service.controller;

import com.microdfd.auth_service.dto.RegisterUserDTO;
import com.microdfd.auth_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/auth/register")
    ResponseEntity<Void> registerUser(@RequestBody RegisterUserDTO registerUserDTO) {
        userService.registerUser(registerUserDTO);
        return ResponseEntity.ok().build();
    }
}
