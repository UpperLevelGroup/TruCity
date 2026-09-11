package com.trucity.candidate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", unique = true)
    private UUID userId;

    @Column(name = "headline")
    private String headline;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "location")
    private String location;

    @Column(name = "years_experience")
    private Integer yearsExperience;

    @Column(name = "profile_completion")
    private Integer profileCompletion;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (yearsExperience == null) {
            yearsExperience = 0;
        }

        if (profileCompletion == null) {
            profileCompletion = 0;
        }
    }
}