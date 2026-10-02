package com.medistock.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.backend.entity.ai.AiModelRegistry;
import com.medistock.backend.entity.ai.AiPrediction;
import com.medistock.backend.repository.ai.AiModelRegistryRepository;
import com.medistock.backend.repository.ai.AiPredictionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class AiPredictionService {

    private final AiPredictionRepository predictionRepository;
    private final AiModelRegistryRepository modelRegistryRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiPredictionService(AiPredictionRepository predictionRepository,
                               AiModelRegistryRepository modelRegistryRepository) {
        this.predictionRepository = predictionRepository;
        this.modelRegistryRepository = modelRegistryRepository;
    }

    @Transactional
    public void recordPrediction(UUID organizationId, UUID branchId, 
                                 String modelName, String entityType, UUID entityId, 
                                 String predictionType, Object inputData, 
                                 Map<String, Object> responseData) {
        try {
            // 1. Find Champion Model
            AiModelRegistry model = modelRegistryRepository
                    .findByModelNameAndDeploymentStatus(modelName, "PRODUCTION")
                    .orElse(null); // It's okay if null, we just track modelName in JSON if needed, but best if it exists
            
            AiPrediction prediction = new AiPrediction();
            prediction.setOrganizationId(organizationId);
            prediction.setBranchId(branchId);
            prediction.setModel(model);
            
            if (model != null) {
                prediction.setModelVersion(model.getVersion());
            } else if (responseData.containsKey("model_version")) {
                prediction.setModelVersion((String) responseData.get("model_version"));
            }

            prediction.setEntityType(entityType);
            prediction.setEntityId(entityId);
            prediction.setPredictionType(predictionType);
            
            // Generate basic hash of input (in a real app, canonicalize json)
            String inputJson = objectMapper.writeValueAsString(inputData);
            prediction.setInputSnapshotHash(String.valueOf(inputJson.hashCode()));
            
            prediction.setPredictionJson(objectMapper.writeValueAsString(responseData));
            
            if (responseData.containsKey("confidence")) {
                prediction.setConfidence(String.valueOf(responseData.get("confidence")));
            }
            if (responseData.containsKey("evidence")) {
                prediction.setUncertaintyJson(objectMapper.writeValueAsString(responseData.get("evidence")));
            }
            if (responseData.containsKey("feature_version")) {
                prediction.setFeatureVersion((String) responseData.get("feature_version"));
            }
            if (responseData.containsKey("data_freshness")) {
                prediction.setDataFreshness((String) responseData.get("data_freshness"));
            }

            predictionRepository.save(prediction);
            
        } catch (Exception e) {
            System.err.println("Failed to record AI Prediction: " + e.getMessage());
            // Do not block the business flow if auditing fails
        }
    }
}
