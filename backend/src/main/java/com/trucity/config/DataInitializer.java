package com.trucity.config;


import com.trucity.user.Role;
import com.trucity.user.RoleRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;



@Configuration
@RequiredArgsConstructor
public class DataInitializer {


    private final RoleRepository roleRepository;



    @Bean
    CommandLineRunner initRoles(){


        return args -> {

            createRole("CANDIDATE");
            createRole("EMPLOYER");
            createRole("ADMIN");
            createRole("VERIFIER");

        };


    }



    private void createRole(String name){


        if(!roleRepository.existsByName(name)){


            Role role = Role.builder()
                    .name(name)
                    .build();


            roleRepository.save(role);


        }


    }


}