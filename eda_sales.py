import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

def run_eda():
    print("Loading Sales dataset...")
    df = pd.read_csv(r"C:\Users\chira\Downloads\archive\sales_data.csv")
    
    out_dir = r"C:\Users\chira\Downloads\medistock-pro\docs\eda"
    os.makedirs(out_dir, exist_ok=True)
    
    print("Generating EDA charts...")
    sns.set_theme(style="whitegrid")
    
    # 1. Sales by Region
    plt.figure(figsize=(10, 6))
    region_sales = df.groupby('Region')['Units Sold'].sum().reset_index()
    sns.barplot(data=region_sales, x='Region', y='Units Sold', palette='Blues_d')
    plt.title("Total Units Sold by Region")
    plt.savefig(os.path.join(out_dir, "sales_by_region.png"))
    plt.close()
    
    # 2. Demand vs Inventory Level Scatter
    plt.figure(figsize=(10, 6))
    sns.scatterplot(data=df.sample(1000), x='Inventory Level', y='Demand', hue='Category', alpha=0.6)
    plt.title("Demand vs Inventory Level (Sampled)")
    plt.savefig(os.path.join(out_dir, "demand_vs_inventory.png"))
    plt.close()
    
    # 3. Effect of Promotion on Demand
    plt.figure(figsize=(8, 6))
    sns.boxplot(data=df, x='Promotion', y='Demand', palette='Set2')
    plt.title("Effect of Promotion on Demand")
    plt.savefig(os.path.join(out_dir, "promotion_effect.png"))
    plt.close()
    
    # Generate Markdown Report
    report_content = f"""# Exploratory Data Analysis - MediStock Sales & Inventory

## Overview
- **Total Records:** {len(df):,}
- **Average Price:** ${df['Price'].mean():.2f}
- **Average Demand:** {df['Demand'].mean():.2f} units
- **Categories:** {', '.join(df['Category'].unique())}

## Insights
1. **Sales by Region:** Displays the geographical distribution of volume.
![Sales by Region](eda/sales_by_region.png)

2. **Demand vs Inventory:** Scatter plot indicating if stock levels are matching actual demand. 
![Demand vs Inventory](eda/demand_vs_inventory.png)

3. **Promotion Effect:** Shows the variance and mean shift in demand when a promotion is active (`Promotion=1`).
![Promotion Effect](eda/promotion_effect.png)

*(Generated automatically by `eda_sales.py`)*
"""
    with open(r"C:\Users\chira\Downloads\medistock-pro\docs\EDA_REPORT.md", "w") as f:
        f.write(report_content)
        
    print("EDA finished! Report generated at docs/EDA_REPORT.md")

if __name__ == "__main__":
    run_eda()
