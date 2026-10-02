package com.medistock.backend.entity.pharmacy;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class DispensingRequest {
    private List<DispensingRequestItem> items;
}
