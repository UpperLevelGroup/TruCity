package com.trucity.auth;

import com.trucity.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public AuthResponse register(
            @RequestBody RegisterRequest request
    ) {
        return service.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody LoginRequest request
    ) {
        return service.login(request);
    }

    @GetMapping("/me")
    public CurrentUserResponse getCurrentUser(
            @AuthenticationPrincipal User user
    ) {
        return CurrentUserResponse.from(user);
    }
}