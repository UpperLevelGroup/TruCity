package com.trucity.controller;

import com.trucity.company.CompanyCandidateDetailsResponse;
import com.trucity.company.CompanyCandidateDetailsService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

/** Admin-only oversight endpoints. Every moderation action is persisted server-side. */
@RestController
@RequestMapping("/admin/oversight")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOversightController {
    @PersistenceContext private EntityManager em;
    private final CompanyCandidateDetailsService candidateDetailsService;

    @GetMapping("/candidates/{candidateId}")
    public CompanyCandidateDetailsResponse candidateDetails(@PathVariable UUID candidateId) {
        return candidateDetailsService.getCandidateDetailsForAdmin(candidateId);
    }

    @GetMapping("/people")
    public List<Map<String,Object>> people(
            @RequestParam(required=false) String q,
            @RequestParam(required=false) String province,
            @RequestParam(required=false) String role) {
        String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        String prov = province == null ? "" : province.trim().toLowerCase(Locale.ROOT);
        String requestedRole = role == null ? "" : role.trim().toUpperCase(Locale.ROOT);
        @SuppressWarnings("unchecked") List<Object[]> rows = em.createNativeQuery("""
          SELECT u.id, cp.id, u.first_name, u.last_name, u.email, r.name,
                 COALESCE(cp.location, c.region, c.registered_address, ''),
                 COALESCE(u.enabled, true), COALESCE(u.is_verified, false), u.created_at,
                 COALESCE(c.name, '')
          FROM users u
          JOIN user_roles ur ON ur.user_id=u.id
          JOIN roles r ON r.id=ur.role_id
          LEFT JOIN candidate_profiles cp ON cp.user_id=u.id
          LEFT JOIN employer_profiles ep ON ep.user_id=u.id
          LEFT JOIN companies c ON c.id=ep.company_id
          WHERE (:query='' OR LOWER(CONCAT(COALESCE(u.first_name,''),' ',COALESCE(u.last_name,''),' ',u.email,' ',COALESCE(c.name,''))) LIKE CONCAT('%',:query,'%'))
            AND (:province='' OR LOWER(COALESCE(cp.location,c.region,c.registered_address,'')) LIKE CONCAT('%',:province,'%'))
            AND (:role='' OR UPPER(r.name)=:role)
          ORDER BY u.created_at DESC
          """).setParameter("query",query).setParameter("province",prov).setParameter("role",requestedRole).getResultList();
        List<Map<String,Object>> out = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String,Object> item = new LinkedHashMap<>();
            item.put("id", r[0]); item.put("profileId", r[1]); item.put("firstName", r[2]); item.put("lastName", r[3]);
            item.put("email", r[4]); item.put("role", r[5]); item.put("location", r[6]);
            item.put("active", r[7]); item.put("verified", r[8]); item.put("createdAt", r[9]); item.put("companyName", r[10]);
            out.add(item);
        }
        return out;
    }


    @GetMapping("/cipc")
    public List<Map<String,Object>> cipcQueue(@RequestParam(required=false) String status) {
        String requested = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        @SuppressWarnings("unchecked") List<Object[]> rows = em.createNativeQuery("""
          SELECT c.id, c.name, c.trading_name, c.registration_number, c.region, c.registered_address,
                 c.verification_status, c.verification_checked_at, c.verification_notes, c.cipc_enterprise_name,
                 c.cipc_enterprise_status, c.cipc_registration_date, c.cipc_physical_address
          FROM companies c
          WHERE (:status='' OR UPPER(c.verification_status)=:status)
          ORDER BY CASE WHEN c.verification_status='NOT_VERIFIED' THEN 0 ELSE 1 END, c.created_at DESC
          """).setParameter("status",requested).getResultList();
        List<Map<String,Object>> out = new ArrayList<>();
        for (Object[] r : rows) { Map<String,Object> m = new LinkedHashMap<>();
            m.put("id",r[0]); m.put("name",r[1]); m.put("tradingName",r[2]); m.put("registrationNumber",r[3]);
            m.put("province",r[4]); m.put("registeredAddress",r[5]); m.put("verificationStatus",r[6]);
            m.put("checkedAt",r[7]); m.put("notes",r[8]); m.put("cipcEnterpriseName",r[9]); m.put("cipcEnterpriseStatus",r[10]);
            m.put("registrationDate",r[11]); m.put("cipcAddress",r[12]); out.add(m); }
        return out;
    }

    @PatchMapping("/cipc/{companyId}")
    @Transactional
    public Map<String,Object> reviewCipc(@PathVariable UUID companyId, @RequestBody Map<String,String> body) {
        String status = body == null ? null : body.get("status");
        if (status == null || !Set.of("VERIFIED","REJECTED","NEEDS_REVIEW","NOT_VERIFIED").contains(status.trim().toUpperCase(Locale.ROOT)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Status must be VERIFIED, REJECTED, NEEDS_REVIEW or NOT_VERIFIED.");
        String clean = status.trim().toUpperCase(Locale.ROOT);
        int changed = em.createNativeQuery("UPDATE companies SET verification_status=:status, verification_checked_at=:checked, verification_notes=:notes WHERE id=:id")
            .setParameter("status",clean).setParameter("checked",LocalDateTime.now()).setParameter("notes",body == null ? null : body.get("notes")).setParameter("id",companyId).executeUpdate();
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Company not found.");
        return Map.of("companyId",companyId,"verificationStatus",clean,"checkedAt",LocalDateTime.now());
    }

    @GetMapping("/messages")
    public List<Map<String,Object>> conversations() {
        @SuppressWarnings("unchecked") List<Object[]> rows = em.createNativeQuery("""
          SELECT c.id, c.participant_one_type, c.participant_one_id, c.participant_two_type,
                 c.participant_two_id, COALESCE(c.status,'ACTIVE'), c.created_at, c.updated_at,
                 (SELECT m.message FROM messages m WHERE m.conversation_id=c.id ORDER BY m.created_at DESC LIMIT 1),
                 (SELECT m.created_at FROM messages m WHERE m.conversation_id=c.id ORDER BY m.created_at DESC LIMIT 1),
                 (SELECT COUNT(*) FROM messages m WHERE m.conversation_id=c.id),
                 CASE
                   WHEN UPPER(c.participant_one_type) IN ('CANDIDATE','ADMIN')
                     THEN COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u1.first_name,''),' ',COALESCE(u1.last_name,''))),''), u1.email, c.participant_one_type)
                   WHEN UPPER(c.participant_one_type) IN ('EMPLOYER','COMPANY')
                     THEN COALESCE(NULLIF(co1.name,''), NULLIF(co1.trading_name,''), c.participant_one_type)
                   WHEN UPPER(c.participant_one_type)='CHATBOT' THEN 'TruCity Assistant'
                   ELSE c.participant_one_type
                 END,
                 CASE
                   WHEN UPPER(c.participant_two_type) IN ('CANDIDATE','ADMIN')
                     THEN COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u2.first_name,''),' ',COALESCE(u2.last_name,''))),''), u2.email, c.participant_two_type)
                   WHEN UPPER(c.participant_two_type) IN ('EMPLOYER','COMPANY')
                     THEN COALESCE(NULLIF(co2.name,''), NULLIF(co2.trading_name,''), c.participant_two_type)
                   WHEN UPPER(c.participant_two_type)='CHATBOT' THEN 'TruCity Assistant'
                   ELSE c.participant_two_type
                 END
          FROM conversations c
          LEFT JOIN users u1 ON UPPER(c.participant_one_type) IN ('CANDIDATE','ADMIN') AND u1.id=c.participant_one_id
          LEFT JOIN companies co1 ON UPPER(c.participant_one_type) IN ('EMPLOYER','COMPANY') AND co1.id=c.participant_one_id
          LEFT JOIN users u2 ON UPPER(c.participant_two_type) IN ('CANDIDATE','ADMIN') AND u2.id=c.participant_two_id
          LEFT JOIN companies co2 ON UPPER(c.participant_two_type) IN ('EMPLOYER','COMPANY') AND co2.id=c.participant_two_id
          ORDER BY c.updated_at DESC
          """).getResultList();
        List<Map<String,Object>> out = new ArrayList<>();
        for (Object[] r : rows) { Map<String,Object> m = new LinkedHashMap<>();
            m.put("id",r[0]); m.put("participantOneType",r[1]); m.put("participantOneId",r[2]);
            m.put("participantTwoType",r[3]); m.put("participantTwoId",r[4]); m.put("status",r[5]);
            m.put("createdAt",r[6]); m.put("updatedAt",r[7]); m.put("lastMessage",r[8]); m.put("lastMessageAt",r[9]); m.put("messageCount",r[10]);
            m.put("participantOneName",r[11]); m.put("participantTwoName",r[12]); out.add(m); }
        return out;
    }

    @GetMapping("/messages/{conversationId}")
    public List<Map<String,Object>> messages(@PathVariable UUID conversationId) {
        @SuppressWarnings("unchecked") List<Object[]> rows = em.createNativeQuery("""
          SELECT m.id, m.conversation_id, m.sender_type, m.sender_id, m.message, m.created_at, m.read_at,
                 CASE
                   WHEN UPPER(m.sender_type) IN ('CANDIDATE','ADMIN')
                     THEN COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.first_name,''),' ',COALESCE(u.last_name,''))),''), u.email, m.sender_type)
                   WHEN UPPER(m.sender_type) IN ('EMPLOYER','COMPANY')
                     THEN COALESCE(NULLIF(co.name,''), NULLIF(co.trading_name,''), m.sender_type)
                   WHEN UPPER(m.sender_type)='CHATBOT' THEN 'TruCity Assistant'
                   ELSE m.sender_type
                 END AS sender_name
          FROM messages m
          LEFT JOIN users u ON UPPER(m.sender_type) IN ('CANDIDATE','ADMIN') AND u.id=m.sender_id
          LEFT JOIN companies co ON UPPER(m.sender_type) IN ('EMPLOYER','COMPANY') AND co.id=m.sender_id
          WHERE m.conversation_id=:id ORDER BY m.created_at ASC
          """).setParameter("id",conversationId).getResultList();
        List<Map<String,Object>> out = new ArrayList<>();
        for (Object[] r : rows) { Map<String,Object> m = new LinkedHashMap<>(); m.put("id",r[0]); m.put("conversationId",r[1]); m.put("senderType",r[2]); m.put("senderId",r[3]); m.put("text",r[4]); m.put("createdAt",r[5]); m.put("readAt",r[6]); m.put("senderName",r[7]); out.add(m); }
        return out;
    }

    @PatchMapping("/messages/{conversationId}/terminate")
    @Transactional
    public Map<String,Object> terminateConversation(@PathVariable UUID conversationId, @RequestBody(required=false) Map<String,String> body) {
        int changed = em.createNativeQuery("UPDATE conversations SET status='TERMINATED', terminated_at=:now, termination_reason=:reason WHERE id=:id AND COALESCE(status,'ACTIVE') <> 'TERMINATED'")
            .setParameter("now", LocalDateTime.now()).setParameter("reason", body == null ? "Admin moderation" : Optional.ofNullable(body.get("reason")).orElse("Admin moderation")).setParameter("id",conversationId).executeUpdate();
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Conversation not found or already terminated.");
        return Map.of("id",conversationId,"status","TERMINATED");
    }

    @PatchMapping("/users/{userId}/suspension")
    @Transactional
    public Map<String,Object> suspendUser(@PathVariable UUID userId, @RequestBody Map<String,Object> body) {
        boolean suspended = Boolean.TRUE.equals(body.get("suspended"));
        int changed = em.createNativeQuery("UPDATE users SET enabled=:enabled WHERE id=:id")
            .setParameter("enabled", !suspended).setParameter("id",userId).executeUpdate();
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found.");
        return Map.of("userId",userId,"suspended",suspended);
    }

    @PostMapping("/users/{userId}/flags")
    @Transactional
    public Map<String,Object> flagUser(@PathVariable UUID userId, @RequestBody Map<String,String> body) {
        String reason = body == null ? null : body.get("reason");
        if (reason == null || reason.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A flag reason is required.");
        em.createNativeQuery("INSERT INTO admin_user_flags (id,user_id,reason,created_at,resolved) VALUES (:id,:userId,:reason,:now,false)")
            .setParameter("id",UUID.randomUUID()).setParameter("userId",userId).setParameter("reason",reason.trim()).setParameter("now",LocalDateTime.now()).executeUpdate();
        return Map.of("userId",userId,"flagged",true,"reason",reason.trim());
    }

    @PatchMapping("/posts/{kind}/{postId}/suspension")
    @Transactional
    public Map<String,Object> suspendPost(@PathVariable String kind, @PathVariable UUID postId, @RequestBody Map<String,Object> body) {
        boolean suspended = !Boolean.FALSE.equals(body.get("suspended"));
        int changed;
        if ("job".equalsIgnoreCase(kind)) {
            if (suspended) {
                changed = em.createNativeQuery("UPDATE jobs SET moderation_previous_status=CASE WHEN status <> 'SUSPENDED' THEN status ELSE moderation_previous_status END, status='SUSPENDED' WHERE id=:id")
                    .setParameter("id",postId).executeUpdate();
            } else {
                changed = em.createNativeQuery("UPDATE jobs SET status=COALESCE(moderation_previous_status,'OPEN'), moderation_previous_status=NULL WHERE id=:id AND status='SUSPENDED'")
                    .setParameter("id",postId).executeUpdate();
            }
        } else if ("company-hub".equalsIgnoreCase(kind)) {
            if (suspended) {
                changed = em.createNativeQuery("UPDATE company_hub_content SET moderation_previous_status=CASE WHEN status <> 'SUSPENDED' THEN status ELSE moderation_previous_status END, status='SUSPENDED', updated_at=:now WHERE id=:id")
                    .setParameter("now",LocalDateTime.now()).setParameter("id",postId).executeUpdate();
            } else {
                changed = em.createNativeQuery("UPDATE company_hub_content SET status=COALESCE(moderation_previous_status,'DRAFT'), moderation_previous_status=NULL, updated_at=:now WHERE id=:id AND status='SUSPENDED'")
                    .setParameter("now",LocalDateTime.now()).setParameter("id",postId).executeUpdate();
            }
        } else throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Supported post kinds are job and company-hub.");
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Post not found.");
        return Map.of("id",postId,"kind",kind,"suspended",suspended);
    }

    @GetMapping("/applications/{applicationId}/answers")
    public List<Map<String,Object>> applicationAnswers(@PathVariable UUID applicationId) {
        @SuppressWarnings("unchecked") List<Object[]> rows = em.createNativeQuery("""
          SELECT aa.id, aa.question_text_snapshot, aa.question_type_snapshot, aa.answer_text, CAST(aa.answer_json AS text), aa.created_at
          FROM application_answers aa WHERE aa.application_id=:id ORDER BY aa.created_at ASC, aa.id ASC
          """).setParameter("id",applicationId).getResultList();
        List<Map<String,Object>> out = new ArrayList<>();
        for (Object[] r : rows) { Map<String,Object> m = new LinkedHashMap<>(); m.put("id",r[0]); m.put("questionText",r[1]); m.put("questionType",r[2]); m.put("answerText",r[3]); m.put("answerJson",r[4]); m.put("createdAt",r[5]); out.add(m); }
        return out;
    }
}
