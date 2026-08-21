package com.trucity.security;


import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import javax.crypto.SecretKey;
import java.util.Date;



@Service
public class JwtService {


    private final SecretKey key;

    private final long expiration;



    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration
    ){

        this.key =
                Keys.hmacShaKeyFor(
                        secret.getBytes()
                );

        this.expiration = expiration;

    }




    public String generateToken(String email){


        return Jwts.builder()

                .subject(email)

                .issuedAt(new Date())

                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                + expiration
                        )
                )

                .signWith(key)

                .compact();

    }




    public String extractUsername(String token){


        return Jwts.parser()

                .verifyWith(key)

                .build()

                .parseSignedClaims(token)

                .getPayload()

                .getSubject();

    }





    public boolean validateToken(String token){


        try {


            Jwts.parser()

                    .verifyWith(key)

                    .build()

                    .parseSignedClaims(token);


            return true;


        }
        catch(Exception e){

            return false;

        }

    }


}