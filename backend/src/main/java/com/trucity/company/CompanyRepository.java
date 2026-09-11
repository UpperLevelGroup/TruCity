package com.trucity.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {

    @Query(
            value = """
                    SELECT c.*
                    FROM companies c
                    JOIN employer_profiles ep
                        ON ep.company_id = c.id
                    JOIN users u
                        ON u.id = ep.user_id
                    WHERE LOWER(u.email) = LOWER(:email)
                    LIMIT 1
                    """,
            nativeQuery = true
    )
    Company findCompanyByEmployerEmail(
            @Param("email") String email
    );
}
