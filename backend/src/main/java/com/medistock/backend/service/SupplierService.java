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
}
