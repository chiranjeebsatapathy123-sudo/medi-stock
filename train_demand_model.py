import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error

def train_model():
    print("Loading demand forecasting dataset...")
    # Load kaggle train.csv
    df = pd.read_csv(r"C:\Users\chira\Downloads\demand-forecasting-kernels-only\train.csv")
    
    print(f"Loaded {len(df)} records. Preprocessing...")
    
    # We will sample it because 17M bytes might be large (like 900k rows)
    # Using 100,000 for realistic fast training
    df = df.sample(n=100000, random_state=42)
    
    # Convert date
    df['date'] = pd.to_datetime(df['date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    df['dayofweek'] = df['date'].dt.dayofweek
    
    # Features & Target
    X = df[['store', 'item', 'year', 'month', 'day', 'dayofweek']]
    y = df['sales']
    
    print("Splitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForestRegressor model...")
    # Using n_estimators=50 and max_depth=15 for speed vs performance trade-off
    model = RandomForestRegressor(n_estimators=50, max_depth=15, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    print(f"Model Evaluation Metrics:\n - MAE: {mae:.2f}\n - RMSE: {rmse:.2f}")
    
    # Save the model
    out_dir = r"C:\Users\chira\Downloads\medistock-pro\backend\src\main\resources\ai"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "demand_model.pkl")
    
    with open(out_path, 'wb') as f:
        pickle.dump(model, f)
        
    print(f"Model successfully saved to {out_path}!")

if __name__ == "__main__":
    train_model()
