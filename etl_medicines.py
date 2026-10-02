import pandas as pd
import uuid
import random
import os
from datetime import datetime, timezone

def generate_etl():
    print("Loading A_Z Medicines Dataset...")
    df_az = pd.read_csv(r"C:\Users\chira\Downloads\archive (2)\A_Z_medicines_dataset_of_India.csv")
    
    print("Loading Detailed Medicine Dataset...")
    df_details = pd.read_csv(r"C:\Users\chira\Downloads\archive (1)\medicine_dataset.csv")

    df_az['name_clean'] = df_az['name'].astype(str).str.lower().str.strip()
    df_details['name_clean'] = df_details['name'].astype(str).str.lower().str.strip()

    print("Merging datasets...")
    df_merged = pd.merge(df_az, df_details, on='name_clean', how='left')
    
    df_sampled = df_merged.sample(n=10000, random_state=42).reset_index(drop=True)

    print("Transforming to MediStock schema...")
    
    org_id = str(uuid.uuid4())
    records = []
    now_str = datetime.now(timezone.utc).isoformat()
    
    for idx, row in df_sampled.iterrows():
        generic = str(row['short_composition1']) if pd.notna(row['short_composition1']) else "Unknown Composition"
        brand = str(row['name_x']) if pd.notna(row['name_x']) else str(row['name_y'])
        category = str(row['Therapeutic Class']) if pd.notna(row['Therapeutic Class']) else "General"
        form = str(row['type']).title() if pd.notna(row['type']) else "Tablet"
        manufacturer = str(row['manufacturer_name']) if pd.notna(row['manufacturer_name']) else "Unknown Manufacturer"
        
        desc_parts = []
        if pd.notna(row['use0']): desc_parts.append(f"Uses: {row['use0']}")
        if pd.notna(row['sideEffect0']): desc_parts.append(f"Side effects: {row['sideEffect0']}")
        if pd.notna(row['Chemical Class']): desc_parts.append(f"Chemical: {row['Chemical Class']}")
        description = " | ".join(desc_parts) if desc_parts else "Standard medical supply."

        controlled = str(row['Habit Forming']).strip().lower() == 'yes' if pd.notna(row['Habit Forming']) else False
        temp_sensitive = random.random() < 0.15 
        
        record = {
            "id": str(uuid.uuid4()),
            "organization_id": org_id,
            "medicine_code": f"MED-REAL-{idx+1:06d}",
            "generic_name": generic[:250],
            "brand_name": brand[:250],
            "category": category[:100],
            "dosage_form": form[:100],
            "strength": "Standard",
            "manufacturer": manufacturer[:250],
            "description": description[:1000],
            "unit": "TABLET" if "tablet" in form.lower() else "BOTTLE",
            "prescription_required": random.random() < 0.6,
            "controlled_medicine": controlled,
            "temperature_sensitive": temp_sensitive,
            "storage_requirement": "2-8C Refrigerated" if temp_sensitive else "Room Temperature",
            "reorder_level": random.randint(50, 500),
            "safety_stock": random.randint(20, 200),
            "maximum_stock": random.randint(1000, 5000),
            "active": True,
            "created_at": now_str,
            "updated_at": now_str
        }
        records.append(record)

    df_out = pd.DataFrame(records)
    
    # Write directly to the existing dataset pack so it can be imported via import_postgres.sql
    out_dir = r"C:\Users\chira\Downloads\medistock-dataset-pack\medistock-dataset-pack\data"
    os.makedirs(out_dir, exist_ok=True)
    
    out_path = os.path.join(out_dir, "03_medicines.csv")
    df_out.to_csv(out_path, index=False)
    print(f"Successfully generated {len(df_out)} real medicine records at {out_path}!")

if __name__ == "__main__":
    generate_etl()
