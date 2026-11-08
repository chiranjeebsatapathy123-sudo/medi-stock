package com.medistock.backend.service;

import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class InventoryServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private BatchRepository batchRepository;

    @Mock
    private InventoryTransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InventoryService inventoryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFefoLogic() {
        UUID medId = UUID.randomUUID();
        Medicine medicine = new Medicine();
        medicine.setId(medId);
        
        Organization org = new Organization();
        medicine.setOrganization(org);

        Batch batchA = new Batch();
        batchA.setMedicine(medicine);
        batchA.setCurrentQuantity(20);
        batchA.setExpiryDate(LocalDate.now().plusDays(10));
        batchA.setStatus("ACTIVE");

        Batch batchB = new Batch();
        batchB.setMedicine(medicine);
        batchB.setCurrentQuantity(50);
        batchB.setExpiryDate(LocalDate.now().plusDays(30));
        batchB.setStatus("ACTIVE");

        when(medicineRepository.findById(medId)).thenReturn(Optional.of(medicine));
        when(batchRepository.findAll()).thenReturn(Arrays.asList(batchB, batchA)); // Unordered

        inventoryService.issueStock(medId, 30, UUID.randomUUID(), "Test Issue", UUID.randomUUID());

        assertEquals(0, batchA.getCurrentQuantity(), "Batch A should be exhausted");
        assertEquals(40, batchB.getCurrentQuantity(), "Batch B should have 40 left");
        
        verify(batchRepository, times(2)).save(any(Batch.class));
        verify(transactionRepository, times(2)).save(any(InventoryTransaction.class));
    }

    @Test
    void testInsufficientStock() {
        UUID medId = UUID.randomUUID();
        Medicine medicine = new Medicine();
        medicine.setId(medId);

        Batch batchA = new Batch();
        batchA.setMedicine(medicine);
        batchA.setCurrentQuantity(20);
        batchA.setExpiryDate(LocalDate.now().plusDays(10));
        batchA.setStatus("ACTIVE");

        when(medicineRepository.findById(medId)).thenReturn(Optional.of(medicine));
        when(batchRepository.findAll()).thenReturn(Arrays.asList(batchA));

        Exception exception = assertThrows(IllegalStateException.class, () -> {
            inventoryService.issueStock(medId, 30, UUID.randomUUID(), "Test Issue", UUID.randomUUID());
        });
        
        assertTrue(exception.getMessage().contains("Insufficient eligible stock"));
    }

    @Test
    void testPartialTransferLotSplitting() {
        UUID batchId = UUID.randomUUID();
        UUID sourceLoc = UUID.randomUUID();
        UUID destLoc = UUID.randomUUID();

        Medicine medicine = new Medicine();
        medicine.setId(UUID.randomUUID());

        Batch sourceBatch = new Batch();
        sourceBatch.setId(batchId);
        sourceBatch.setMedicine(medicine);
        sourceBatch.setBatchNumber("LOT-2026-X1");
        sourceBatch.setCurrentQuantity(100);
        sourceBatch.setStorageLocationId(sourceLoc);

        when(batchRepository.findById(batchId)).thenReturn(Optional.of(sourceBatch));
        when(batchRepository.save(any(Batch.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> result = inventoryService.transferStock(batchId, sourceLoc, destLoc, 35, "Splitting to floor rack", UUID.randomUUID(), null);

        assertEquals("SUCCESS", result.get("status"));
        assertEquals(65, sourceBatch.getCurrentQuantity(), "Source batch should have 65 remaining");
        verify(batchRepository, times(2)).save(any(Batch.class)); // 1 for reduced source, 1 for new split batch
        verify(transactionRepository, times(1)).save(any(InventoryTransaction.class));
    }
}
