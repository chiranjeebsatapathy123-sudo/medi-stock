# AI Integration Audit

## 1. Existing Models & Locations
- **DemandForecastModel:** Located at `backend/src/main/resources/ai/demand_model.pkl` (Trained using `RandomForestRegressor`).

## 2. Training Scripts
- `train_demand_model.py`: Uses `scikit-learn` to train a Random Forest model on Kaggle demand dataset.
- `eda_sales.py`: Conducts exploratory data analysis on real sales data.
- `etl_medicines.py`: Merges and transforms Indian A-Z medicines and Detailed side-effect CSVs into `03_medicines.csv` for Postgres.

## 3. Datasets & Feature Pipelines
- **Datasets:** Kaggle Sales & Store Item Demand (`demand-forecasting-kernels-only`), Indian Medicines (`archive 1 & 2`).
- **Feature Pipelines:** `train_demand_model.py` manually extracts `year`, `month`, `day`, `dayofweek`. No centralized feature store exists.
- **Dataset Manifests:** None exist. Models are tied to implicit CSVs.

## 4. Prediction Code & APIs
- **Python Inference:** `predict_demand.py` loads `.pkl` and serves JSON predictions via standard out.
- **Java Inference:** `ForecastService.java` invokes `predict_demand.py` via `ProcessBuilder`.
- **APIs:** `AiController.java` exposes endpoints for `/api/ai/` (e.g. `ForecastService`, `AiInventoryService`, `AiAnomalyDetectionService`).

## 5. Missing Components
- **Model Registry:** No database tables for `ai_model_registry` or tracking versions/aliases.
- **Dataset Versioning:** No `dataset_versions` table to map a model back to a reproducible training set.
- **Prediction Persistance:** No `ai_predictions` table. Predictions are ephemeral.
- **Model Serving Service:** Currently using a hacky `ProcessBuilder` instead of a standalone ML microservice or proper integration pattern.
- **Monitoring & Drift:** No system tracking data/prediction drift or performance degradation.
- **Continuous Learning:** Feedback loop from UI to retraining pipeline is absent.

## 6. Duplicated/Obsolete Code
- `AiInventoryService.java` and `AiAnomalyDetectionService.java` might contain hardcoded fallback mock heuristics that need to be replaced with the real AI system or explicitly labeled as rule-based fallbacks.
- Any UI placeholders or dummy metrics representing AI values must be expunged.

## 7. Deployment Blockers
- **Scalability:** `ProcessBuilder` in `ForecastService` is not scalable for high-throughput concurrent requests. A proper serving layer is required.
- **Security:** Model artifacts aren't checksummed; loading a `.pkl` is vulnerable to arbitrary code execution if compromised.
- **Availability:** ML runtime (Python) is tightly coupled to the Spring Boot host container rather than isolated.
