package com.medistock.backend.entity.pharmacy;

import lombok.Data;
import java.util.UUID;

@Data
public class DispensingRequestItem {
    private UUID orderItemId;
    private UUID batchId;
    private Integer quantity;
}
