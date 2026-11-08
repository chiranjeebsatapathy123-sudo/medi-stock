package com.medistock.backend.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class Gs1BarcodeService {

    public static class Gs1ParseResult {
        private String rawBarcode;
        private String gtin;
        private LocalDate expiryDate;
        private String lotNumber;
        private String serialNumber;
        private boolean validGs1;

        public String getRawBarcode() { return rawBarcode; }
        public void setRawBarcode(String rawBarcode) { this.rawBarcode = rawBarcode; }

        public String getGtin() { return gtin; }
        public void setGtin(String gtin) { this.gtin = gtin; }

        public LocalDate getExpiryDate() { return expiryDate; }
        public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

        public String getLotNumber() { return lotNumber; }
        public void setLotNumber(String lotNumber) { this.lotNumber = lotNumber; }

        public String getSerialNumber() { return serialNumber; }
        public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

        public boolean isValidGs1() { return validGs1; }
        public void setValidGs1(boolean validGs1) { this.validGs1 = validGs1; }

        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            map.put("rawBarcode", rawBarcode);
            map.put("gtin", gtin);
            map.put("expiryDate", expiryDate != null ? expiryDate.toString() : null);
            map.put("lotNumber", lotNumber);
            map.put("serialNumber", serialNumber);
            map.put("validGs1", validGs1);
            return map;
        }
    }

    private static final Pattern PAREN_GTIN = Pattern.compile("\\(01\\)(\\d{14})");
    private static final Pattern PAREN_EXPIRY = Pattern.compile("\\(17\\)(\\d{6})");
    private static final Pattern PAREN_LOT = Pattern.compile("\\(10\\)([A-Za-z0-9_-]+)");
    private static final Pattern PAREN_SERIAL = Pattern.compile("\\(21\\)([A-Za-z0-9_-]+)");

    public Gs1ParseResult parse(String rawBarcode) {
        Gs1ParseResult result = new Gs1ParseResult();
        if (rawBarcode == null || rawBarcode.trim().isEmpty()) {
            result.setValidGs1(false);
            return result;
        }

        String cleaned = rawBarcode.trim();
        result.setRawBarcode(cleaned);

        // 1. Check parenthesized GS1 format (common in software scanners)
        if (cleaned.contains("(01)") || cleaned.contains("(17)") || cleaned.contains("(10)")) {
            Matcher mGtin = PAREN_GTIN.matcher(cleaned);
            if (mGtin.find()) result.setGtin(mGtin.group(1));

            Matcher mExp = PAREN_EXPIRY.matcher(cleaned);
            if (mExp.find()) result.setExpiryDate(parseGs1Date(mExp.group(1)));

            Matcher mLot = PAREN_LOT.matcher(cleaned);
            if (mLot.find()) result.setLotNumber(mLot.group(1));

            Matcher mSer = PAREN_SERIAL.matcher(cleaned);
            if (mSer.find()) result.setSerialNumber(mSer.group(1));

            result.setValidGs1(result.getGtin() != null || result.getLotNumber() != null);
            return result;
        }

        // 2. Check unparenthesized stream: AI 01 is 14 digits, AI 17 is 6 digits
        String stream = cleaned.replace("\u001D", " ");
        int idx = 0;
        boolean foundAi = false;

        while (idx < stream.length()) {
            if (stream.startsWith("01", idx) && stream.length() >= idx + 16) {
                result.setGtin(stream.substring(idx + 2, idx + 16));
                idx += 16;
                foundAi = true;
            } else if (stream.startsWith("17", idx) && stream.length() >= idx + 8) {
                result.setExpiryDate(parseGs1Date(stream.substring(idx + 2, idx + 8)));
                idx += 8;
                foundAi = true;
            } else if (stream.startsWith("10", idx)) {
                int nextSpace = stream.indexOf(' ', idx);
                if (nextSpace == -1) nextSpace = stream.indexOf("21", idx + 2);
                if (nextSpace == -1) nextSpace = stream.length();
                result.setLotNumber(stream.substring(idx + 2, nextSpace).trim());
                idx = nextSpace;
                foundAi = true;
            } else if (stream.startsWith("21", idx)) {
                int nextSpace = stream.indexOf(' ', idx);
                if (nextSpace == -1) nextSpace = stream.length();
                result.setSerialNumber(stream.substring(idx + 2, nextSpace).trim());
                idx = nextSpace;
                foundAi = true;
            } else {
                idx++;
            }
        }

        result.setValidGs1(foundAi && (result.getGtin() != null || result.getLotNumber() != null));
        return result;
    }

    private LocalDate parseGs1Date(String yyMMdd) {
        try {
            if (yyMMdd == null || yyMMdd.length() != 6) return null;
            int year = Integer.parseInt(yyMMdd.substring(0, 2)) + 2000;
            int month = Integer.parseInt(yyMMdd.substring(2, 4));
            int day = Integer.parseInt(yyMMdd.substring(4, 6));
            if (day == 0) day = 28; // GS1 standard: 00 day represents end of month
            return LocalDate.of(year, month, Math.min(day, 28));
        } catch (Exception e) {
            return null;
        }
    }
}

