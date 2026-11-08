package com.medistock.backend.service;

import com.medistock.backend.entity.AuditLog;
import com.medistock.backend.entity.Organization;
import com.medistock.backend.repository.AuditLogRepository;
import com.medistock.backend.repository.OrganizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AuditServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @InjectMocks
    private AuditService auditService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRecordAuditWithCfr11Compliance() {
        UUID orgId = UUID.randomUUID();
        Organization org = new Organization();
        org.setId(orgId);

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(org));
        when(auditLogRepository.findLatestSignatureHash(orgId)).thenReturn(Optional.empty());
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(i -> i.getArgument(0));

        AuditLog log = auditService.recordAudit(
                orgId, UUID.randomUUID(), "Dr. Smith", "CHIEF_PHARMACIST",
                "QUARANTINE_BATCH", "BATCH", UUID.randomUUID(),
                "ACTIVE", "QUARANTINED", "Temperature exceeded threshold during transport"
        );

        assertNotNull(log);
        assertNotNull(log.getSignatureHash());
        assertEquals("GENESIS-BLOCK-HASH-0000000000000000", log.getPreviousHash());
        assertEquals("QUARANTINE_BATCH", log.getAction());
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void testRejectAuditWithoutReason() {
        UUID orgId = UUID.randomUUID();

        assertThrows(IllegalArgumentException.class, () -> {
            auditService.recordAudit(
                    orgId, UUID.randomUUID(), "Dr. Smith", "PHARMACIST",
                    "QUARANTINE_BATCH", "BATCH", UUID.randomUUID(),
                    "ACTIVE", "QUARANTINED", "   "
            );
        });
    }
}

