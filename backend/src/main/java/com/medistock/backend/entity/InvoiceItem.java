package com.medistock.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "invoice_items")
@Data
public class InvoiceItem {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "invoice_id", nullable = false)
    @JsonIgnore
    private Invoice invoice;
    
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
