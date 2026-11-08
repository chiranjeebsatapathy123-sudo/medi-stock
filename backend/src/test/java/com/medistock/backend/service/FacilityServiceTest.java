package com.medistock.backend.service;

import com.medistock.backend.entity.Batch;
import com.medistock.backend.entity.Medicine;
import com.medistock.backend.entity.facility.ColdChainReading;
import com.medistock.backend.entity.facility.FacilityIncident;
import com.medistock.backend.repository.BatchRepository;
import com.medistock.backend.repository.facility.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class FacilityServiceTest {

    @Mock
    private EdgeDeviceRepository deviceRepo;

    @Mock
    private VisionEventRepository visionRepo;

    @Mock
    private FacilityIncidentRepository incidentRepo;

    @Mock
    private MaintenanceTaskRepository maintenanceRepo;

    @Mock
    private ColdChainReadingRepository readingRepo;

    @Mock
    private BatchRepository batchRepo;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private FacilityService facilityService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testNormalReadingIngestion() {
        UUID orgId = UUID.randomUUID();
        ColdChainReading reading = new ColdChainReading();
        reading.setDeviceId("SenseNode-Alpha");
        reading.setLocationCode("LOC-COLD");
        reading.setTemperature(4.5);
        reading.setHumidity(45.0);

        when(readingRepo.save(any(ColdChainReading.class))).thenAnswer(i -> i.getArgument(0));
        when(deviceRepo.findByOrganizationId(orgId)).thenReturn(Collections.emptyList());

        ColdChainReading saved = facilityService.ingestReading(reading, orgId);

        assertNotNull(saved);
        assertEquals("NORMAL", saved.getStatus());
        verify(incidentRepo, never()).save(any(FacilityIncident.class));
    }

    @Test
    void testExcursionTriggersIncidentAndQuarantine() {
        UUID orgId = UUID.randomUUID();
        ColdChainReading excursion = new ColdChainReading();
        excursion.setDeviceId("SenseNode-Alpha");
        excursion.setLocationCode("LOC-COLD");
        excursion.setTemperature(10.2); // Exceeds 8.0C!
        excursion.setHumidity(50.0);

        Medicine insulin = new Medicine();
        insulin.setGenericName("Insulin Glargine");
        insulin.setTemperatureSensitive(true);

        Batch insulinBatch = new Batch();
        insulinBatch.setId(UUID.randomUUID());
        insulinBatch.setMedicine(insulin);
        insulinBatch.setStatus("ACTIVE");
        insulinBatch.setQuarantine(false);

        when(readingRepo.save(any(ColdChainReading.class))).thenAnswer(i -> i.getArgument(0));
        when(deviceRepo.findByOrganizationId(orgId)).thenReturn(Collections.emptyList());
        when(batchRepo.findByMedicineOrganizationId(orgId)).thenReturn(Arrays.asList(insulinBatch));

        ColdChainReading saved = facilityService.ingestReading(excursion, orgId);

        assertEquals("EXCURSION", saved.getStatus());
        verify(incidentRepo, times(1)).save(any(FacilityIncident.class));
        verify(batchRepo, times(1)).save(insulinBatch);
        assertTrue(insulinBatch.isQuarantine());
        assertEquals("QUARANTINED", insulinBatch.getStatus());
    }
}

