package com.trucity.auth;

import com.trucity.user.User;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CurrentUserResponse {

    private UUID id;

    private String firstName;

    private String lastName;

    private String email;

    private List<String> roles;


    public static CurrentUserResponse from(User user) {

        return CurrentUserResponse.builder()

                .id(user.getId())

                .firstName(user.getFirstName())

                .lastName(user.getLastName())

                .email(user.getEmail())

                .roles(
                        user.getRoles()
                                .stream()
                                .map(role -> role.getName())
                                .toList()
                )

                .build();
    }
}