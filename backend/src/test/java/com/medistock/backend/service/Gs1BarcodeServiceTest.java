package com.medistock.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

public class Gs1BarcodeServiceTest {

    private Gs1BarcodeService gs1Service;

    @BeforeEach
    void setUp() {
        gs1Service = new Gs1BarcodeService();
    }

    @Test
    void testParseParenthesizedGs1DataMatrix() {
        String barcode = "(01)00300012345678(17)270418(10)LOT-24F8(21)SN100234";
        Gs1BarcodeService.Gs1ParseResult result = gs1Service.parse(barcode);

        assertTrue(result.isValidGs1());
        assertEquals("00300012345678", result.getGtin());
        assertEquals(LocalDate.of(2027, 4, 18), result.getExpiryDate());
        assertEquals("LOT-24F8", result.getLotNumber());
        assertEquals("SN100234", result.getSerialNumber());
    }

    @Test
    void testParseContinuousStreamGs1() {
        String barcode = "01003000123456781727012210PCM-25A1";
        Gs1BarcodeService.Gs1ParseResult result = gs1Service.parse(barcode);

        assertTrue(result.isValidGs1());
        assertEquals("00300012345678", result.getGtin());
        assertEquals(LocalDate.of(2027, 1, 22), result.getExpiryDate());
        assertEquals("PCM-25A1", result.getLotNumber());
    }

    @Test
    void testInvalidBarcode() {
        String barcode = "INVALID-RANDOM-BARCODE";
        Gs1BarcodeService.Gs1ParseResult result = gs1Service.parse(barcode);

        assertFalse(result.isValidGs1());
        assertNull(result.getGtin());
    }
}

