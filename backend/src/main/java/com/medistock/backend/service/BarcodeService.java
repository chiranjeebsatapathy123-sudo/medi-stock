package com.medistock.backend.service;

import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class BarcodeService {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final Gs1BarcodeService gs1BarcodeService;

    public BarcodeService(MedicineRepository medicineRepository,
                          BatchRepository batchRepository,
                          Gs1BarcodeService gs1BarcodeService) {
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.gs1BarcodeService = gs1BarcodeService;
    }

    public Map<String, Object> lookup(String barcode) {
        if (barcode == null || barcode.trim().isEmpty()) {
            return Map.of("status", "NOT_FOUND");
        }
        String clean = barcode.trim();

        // 1. Try GS1 2D DataMatrix Parsing (FDA DSCSA Standard)
        Gs1BarcodeService.Gs1ParseResult gs1 = gs1BarcodeService.parse(clean);
        if (gs1.isValidGs1()) {
            Map<String, Object> response = new HashMap<>();
            response.put("type", "GS1_DATAMATRIX");
            response.put("status", "FOUND");
            response.put("gs1Data", gs1.toMap());

            Medicine matchedMed = null;
            if (gs1.getGtin() != null) {
                matchedMed = medicineRepository.findAll().stream()
                        .filter(m -> gs1.getGtin().equals(m.getGtin()) || gs1.getGtin().contains(m.getMedicineCode()))
                        .findFirst().orElse(null);
            }

            Batch matchedBatch = null;
            if (gs1.getLotNumber() != null) {
                matchedBatch = batchRepository.findAll().stream()
                        .filter(b -> gs1.getLotNumber().equalsIgnoreCase(b.getBatchNumber()))
                        .findFirst().orElse(null);
                if (matchedBatch != null && matchedMed == null) {
                    matchedMed = matchedBatch.getMedicine();
                }
            }

            if (matchedMed != null) response.put("medicine", matchedMed);
            if (matchedBatch != null) response.put("batch", matchedBatch);

            return response;
        }

        // 2. Direct Batch lookup
        Optional<Batch> directBatch = batchRepository.findAll().stream()
                .filter(b -> clean.equalsIgnoreCase(b.getBatchNumber()) ||
                        (clean.startsWith("BATCH-") && b.getBatchNumber().equalsIgnoreCase(clean.substring(6))))
                .findFirst();

        if (directBatch.isPresent()) {
            return Map.of(
                    "type", "BATCH",
                    "status", "FOUND",
                    "data", directBatch.get(),
                    "medicine", directBatch.get().getMedicine()
            );
        }

        // 3. Direct Medicine lookup
        Optional<Medicine> directMed = medicineRepository.findAll().stream()
                .filter(m -> clean.equalsIgnoreCase(m.getMedicineCode()) ||
                        (clean.startsWith("MED-") && m.getMedicineCode().equalsIgnoreCase(clean.substring(4))) ||
                        clean.equalsIgnoreCase(m.getGtin()))
                .findFirst();

        if (directMed.isPresent()) {
            return Map.of(
                    "type", "MEDICINE",
                    "status", "FOUND",
                    "data", directMed.get()
            );
        }

        return Map.of("status", "NOT_FOUND", "rawBarcode", clean);
    }
}
