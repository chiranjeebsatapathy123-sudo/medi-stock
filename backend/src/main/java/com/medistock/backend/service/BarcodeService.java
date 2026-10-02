package com.medistock.backend.service;

import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class BarcodeService {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;

    public BarcodeService(MedicineRepository medicineRepository, BatchRepository batchRepository) {
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
    }

    public Map<String, Object> lookup(String barcode) {
        // Simple heuristic: If it starts with MED-, lookup Medicine. 
        // If it starts with BATCH-, lookup Batch.
        
        if (barcode.startsWith("MED-")) {
            String code = barcode.substring(4);
            Optional<Medicine> medicine = medicineRepository.findAll().stream()
                .filter(m -> m.getMedicineCode().equals(code))
                .findFirst();
                
            if (medicine.isPresent()) {
                return Map.of("type", "MEDICINE", "status", "FOUND", "data", medicine.get());
            }
        } else if (barcode.startsWith("BATCH-")) {
            String code = barcode.substring(6);
            Optional<Batch> batch = batchRepository.findAll().stream()
                .filter(b -> b.getBatchNumber().equals(code))
                .findFirst();
                
            if (batch.isPresent()) {
                return Map.of("type", "BATCH", "status", "FOUND", "data", batch.get());
            }
        }
        
        return Map.of("status", "NOT_FOUND");
    }
}
