package com.medistock.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "purchase_order_items")
@Data
public class PurchaseOrderItem {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    @JsonBackReference
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    private int quantity;
    
    @Column(name = "received_quantity")
    private int receivedQuantity = 0;

    @Column(name = "unit_price")
    private Double unitPrice;
    
    private Double discount = 0.0;

    @Column(name = "total_price")
    private Double totalPrice;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    private String status = "PENDING";
}
