package com.medistock.backend.entity.pharmacy;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.medistock.backend.entity.Batch;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.UUID;

@Entity
@Table(name = "dispensing_items")
@Data
public class DispensingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispensing_record_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    private DispensingRecord dispensingRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private MedicationOrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Column(nullable = false)
    private Integer quantity;
}
