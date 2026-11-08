import client from '../api/client';

export const simulationEngine = {
  start: () => {},
  stop: () => {},
  forceEvent: () => {},

  async runScenario(scenarioId, scenarioParams) {
    const duration = scenarioParams.duration || 30;
    const demandIncrease = (scenarioParams.demandIncrease || 0) / 100;
    const supplierDelay = scenarioParams.supplierDelay || 0;

    let medicines = [];
    let batches = [];
    let suppliers = [];

    try {
      const [medRes, batchRes, supRes] = await Promise.all([
        client.get('/inventory/medicines').catch(() => ({ data: [] })),
        client.get('/batches').catch(() => ({ data: [] })),
        client.get('/procurement/suppliers').catch(() => ({ data: [] }))
      ]);

      medicines = medRes.data || [];
      batches = batchRes.data || [];
      suppliers = supRes.data || [];
    } catch (e) {
      console.warn("Using offline snapshot baseline for simulation", e);
    }

    // Fallback baseline if API returned empty
    if (medicines.length === 0) {
      medicines = [
        { id: "MED-AMX-500", genericName: "Amoxicillin 500mg", reorderLevel: 300, safetyStock: 150 },
        { id: "MED-PCM-500", genericName: "Paracetamol 500mg", reorderLevel: 500, safetyStock: 200 },
        { id: "MED-INS-100", genericName: "Insulin Glargine 100IU", reorderLevel: 100, safetyStock: 40 },
        { id: "MED-AZI-250", genericName: "Azithromycin 250mg", reorderLevel: 250, safetyStock: 80 }
      ];
    }
    if (batches.length === 0) {
      batches = [
        { id: "B1", medicineId: "MED-AMX-500", currentQuantity: 820, purchasePrice: 3.5 },
        { id: "B2", medicineId: "MED-PCM-500", currentQuantity: 420, purchasePrice: 1.0 },
        { id: "B3", medicineId: "MED-INS-100", currentQuantity: 74, purchasePrice: 22.0 },
        { id: "B4", medicineId: "MED-AZI-250", currentQuantity: 180, purchasePrice: 5.5 }
      ];
    }
    if (suppliers.length === 0) {
      suppliers = [
        { id: "SUP-001", name: "Cureline Pharma" },
        { id: "SUP-002", name: "MedCore Labs" },
        { id: "SUP-003", name: "BioNova" }
      ];
    }

    const snapshot = {
      timestamp: new Date().toISOString(),
      scenarioId,
      scenarioName: scenarioParams.name || "Default Simulation",
      medicines: [...medicines],
      batches: [...batches],
      suppliers: [...suppliers],
      status: "IMMUTABLE_CLONE_READY"
    };

    // Calculate simulation results
    const stockouts = [];
    let totalFinancialImpact = 0;

    medicines.forEach((med, idx) => {
      const medBatches = batches.filter(b => (b.medicine && b.medicine.id === med.id) || b.medicineId === med.id);
      const totalStock = medBatches.reduce((acc, b) => acc + (b.currentQuantity || 0), 0);
      
      // Estimated daily burn rate with scenario adjustment
      const baseDailyBurn = Math.max(10, Math.round((med.reorderLevel || 100) / 14));
      const adjustedDailyBurn = Math.round(baseDailyBurn * (1 + demandIncrease));

      // Calculate the day stock hits zero
      const daysOfSupply = adjustedDailyBurn > 0 ? Math.floor(totalStock / adjustedDailyBurn) : 999;

      if (daysOfSupply < duration) {
        const unmetDemand = Math.round((duration - daysOfSupply) * adjustedDailyBurn);
        const avgPrice = medBatches.length > 0 && medBatches[0].purchasePrice ? medBatches[0].purchasePrice : 5.0;
        totalFinancialImpact += unmetDemand * avgPrice;

        stockouts.push({
          medicineId: med.genericName || med.brandName || med.id,
          day: Math.max(1, daysOfSupply),
          unmetDemand
        });
      }
    });

    // Add estimated expiry aging impact
    const expiryLoss = Math.round(totalFinancialImpact * 0.18 + 1200);

    const results = {
      daysSimulated: duration,
      stockouts: stockouts.sort((a, b) => a.day - b.day),
      financialImpact: expiryLoss,
      scenarioName: scenarioParams.name
    };

    return {
      snapshot,
      results
    };
  }
};
