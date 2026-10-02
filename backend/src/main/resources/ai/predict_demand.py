import sys
import json
import pickle
import os
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

def main():
    try:
        # Load inputs
        input_data = json.loads(sys.argv[1])
        store = int(input_data.get("store", 1))
        item = int(input_data.get("item", 1))
        year = int(input_data.get("year", 2026))
        month = int(input_data.get("month", 10))
        day = int(input_data.get("day", 2))
        dayofweek = int(input_data.get("dayofweek", 4))
        
        # Load Model
        model_path = os.path.join(os.path.dirname(__file__), "demand_model.pkl")
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
            
        # Predict
        prediction = model.predict([[store, item, year, month, day, dayofweek]])
        
        # Print output as JSON for Java to parse
        result = {
            "predictedDemand": float(prediction[0]),
            "confidence": 88.5, # Static for now, could be variance of trees
            "mae": 9.38 # From our training eval
        }
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
