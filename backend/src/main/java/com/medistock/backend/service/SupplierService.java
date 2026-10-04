package com.medistock.backend.service;

import com.medistock.backend.entity.Supplier;
import com.medistock.backend.repository.SupplierRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<Supplier> getSuppliers(UUID orgId) {
        return supplierRepository.findByOrganizationId(orgId);
    }

    @Transactional
    public Supplier createSupplier(Supplier supplier, UUID orgId) {
        supplier.setOrganizationId(orgId);
        if(supplier.getSupplierCode() == null) {
            supplier.setSupplierCode("SUP-" + System.currentTimeMillis());
        }
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier updateSupplier(UUID id, Supplier supplierDetails, UUID orgId) {
        return supplierRepository.findById(id).map(existing -> {
            if (!existing.getOrganizationId().equals(orgId)) throw new RuntimeException("Unauthorized");
            existing.setName(supplierDetails.getName());
            existing.setEmail(supplierDetails.getEmail());
            existing.setContactPerson(supplierDetails.getContactPerson());
            existing.setLeadTimeDays(supplierDetails.getLeadTimeDays());
            return supplierRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Supplier not found"));
    }

    @Transactional
    public void deleteSupplier(UUID id, UUID orgId) {
        supplierRepository.findById(id).ifPresent(existing -> {
            if (existing.getOrganizationId().equals(orgId)) {
                supplierRepository.delete(existing);
            }
        });
    }
}
