package com.trucity.company;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "employer_profiles",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_employer_profiles_user_id",
                        columnNames = "user_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * The authenticated TruCity user who owns this employer profile.
     *
     * We intentionally keep this as UUID rather than a JPA @ManyToOne
     * relationship to User. This keeps the company module independent
     * from the authentication entity implementation.
     */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /**
     * Company associated with this employer.
     */
    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}