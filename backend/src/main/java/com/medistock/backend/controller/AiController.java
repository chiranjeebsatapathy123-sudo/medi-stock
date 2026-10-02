package com.medistock.backend.controller;

import com.medistock.backend.service.AiInventoryService;
import com.medistock.backend.service.ForecastService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiInventoryService aiInventoryService;
    private final ForecastService forecastService;

    public AiController(AiInventoryService aiInventoryService, ForecastService forecastService) {
        this.aiInventoryService = aiInventoryService;
        this.forecastService = forecastService;
    }

    @PostMapping("/query")
    public Map<String, Object> askCopilot(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        return aiInventoryService.handleQuery(query);
    }
    
    @GetMapping("/forecast/{medicineId}")
    public Map<String, Object> getForecast(@PathVariable UUID medicineId, @RequestParam(defaultValue = "30") int horizon) {
        return forecastService.getForecast(medicineId, horizon);
    }
    
    @PostMapping("/predict/stockout-risk")
    public Map<String, Object> predictStockoutRisk(@RequestBody Map<String, String> request) {
        return aiInventoryService.predictStockoutRisk(request);
    }
    
    @GetMapping("/models")
    public java.util.List<Map<String, Object>> getModels() {
        return aiInventoryService.getModels();
    }
    
    @GetMapping("/model-health")
    public Map<String, Object> getModelHealth() {
        return aiInventoryService.getModelHealth();
    }
}
