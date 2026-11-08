package com.medistock.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.backend.entity.AuditLog;
import com.medistock.backend.entity.Organization;
import com.medistock.backend.repository.AuditLogRepository;
import com.medistock.backend.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.ZonedDateTime;
import java.util.*;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final OrganizationRepository organizationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuditService(AuditLogRepository auditLogRepository, OrganizationRepository organizationRepository) {
        this.auditLogRepository = auditLogRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional
    public AuditLog recordAudit(UUID orgId, UUID userId, String userName, String userRole,
                                String action, String entityType, UUID entityId,
                                Object previousState, Object newState, String reasonForChange) {
        if (reasonForChange == null || reasonForChange.trim().isEmpty()) {
            throw new IllegalArgumentException("FDA 21 CFR Part 11 Violation: Mandatory reason for change must be supplied.");
        }

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid organization ID: " + orgId));

        String prevHash = auditLogRepository.findLatestSignatureHash(orgId).orElse("GENESIS-BLOCK-HASH-0000000000000000");

        String prevJson = null;
        String nextJson = null;
        try {
            if (previousState != null) prevJson = objectMapper.writeValueAsString(previousState);
            if (newState != null) nextJson = objectMapper.writeValueAsString(newState);
        } catch (Exception e) {
            prevJson = String.valueOf(previousState);
            nextJson = String.valueOf(newState);
        }

        ZonedDateTime now = ZonedDateTime.now();
        String signaturePayload = prevHash + ":" + orgId + ":" + now.toInstant().toEpochMilli()
                + ":" + action + ":" + entityType + ":" + entityId + ":" + reasonForChange + ":" + nextJson;
        String currentHash = calculateSha256(signaturePayload);

        AuditLog log = new AuditLog();
        log.setOrganization(org);
        log.setTimestamp(now);
        log.setUserId(userId);
        log.setUserName(userName != null ? userName : "System");
        log.setUserRole(userRole != null ? userRole : "SYSTEM");
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setPreviousStateJson(prevJson);
        log.setNewStateJson(nextJson);
        log.setReasonForChange(reasonForChange.trim());
        log.setPreviousHash(prevHash);
        log.setSignatureHash(currentHash);

        return auditLogRepository.save(log);
    }

    public List<AuditLog> getLogsForOrganization(UUID orgId) {
        return auditLogRepository.findByOrganizationIdOrderByTimestampDesc(orgId);
    }

    public List<AuditLog> getLogsForEntity(String entityType, UUID entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    public Map<String, Object> verifyChainIntegrity(UUID orgId) {
        List<AuditLog> logs = auditLogRepository.findByOrganizationIdOrderByTimestampDesc(orgId);
        // Reverse to check from oldest to newest
        Collections.reverse(logs);

        boolean intact = true;
        String expectedPrevHash = "GENESIS-BLOCK-HASH-0000000000000000";
        int verifiedCount = 0;

        for (AuditLog log : logs) {
            if (!Objects.equals(log.getPreviousHash(), expectedPrevHash)) {
                intact = false;
                break;
            }
            expectedPrevHash = log.getSignatureHash();
            verifiedCount++;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("chainIntact", intact);
        result.put("valid", intact);
        result.put("verifiedRecords", verifiedCount);
        result.put("verifiedEntries", verifiedCount);
        result.put("totalRecords", logs.size());
        result.put("complianceStatus", intact ? "FDA 21 CFR Part 11 COMPLIANT" : "AUDIT CHAIN TAMPERED");
        return result;
    }

    private String calculateSha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}

