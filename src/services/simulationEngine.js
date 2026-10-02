import { db, delay } from './mockDb';

export const simulationEngine = {
  async runScenario(scenarioId, assumptions) {
    await delay(1200); // simulate heavy processing
    
    // Create immutable read-only snapshot
    const snapshot = {
      timestamp: new Date().toISOString(),
      medicines: JSON.parse(JSON.stringify(db.medicines)),
      batches: JSON.parse(JSON.stringify(db.batches)),
      suppliers: JSON.parse(JSON.stringify(db.suppliers))
    };

    const days = assumptions.duration || 30;
    const demandMultiplier = 1 + (assumptions.demandIncrease || 0) / 100;
    const supplierDelay = assumptions.supplierDelay || 0;

    const results = {
      scenarioId,
      daysSimulated: days,
      stockouts: [],
      expiryExposure: [],
      financialImpact: 0,
      emergencyPurchases: 0,
      timeline: []
    };

    // Initialize daily state
    let currentState = JSON.parse(JSON.stringify(snapshot.batches));

    for (let day = 1; day <= days; day++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + day);

      let dayEvents = { day, date: currentDate.toISOString(), demand: 0, stockouts: 0, expired: 0 };

      // Process each medicine
      snapshot.medicines.forEach(med => {
        // Find active batches for this med
        let medBatches = currentState.filter(b => b.medicineId === med.id && b.currentQty > 0);
        
        // Expiry processing
        medBatches.forEach(b => {
          if (new Date(b.expiryDate) < currentDate) {
            dayEvents.expired += b.currentQty;
            results.financialImpact += (b.currentQty * b.purchasePrice);
            b.currentQty = 0;
          }
        });

        // Demand processing (baseline reorderLevel/30 as daily demand)
        let dailyDemand = Math.ceil((med.reorderLevel / 30) * demandMultiplier);
        dayEvents.demand += dailyDemand;

        // FEFO consumption
        medBatches = medBatches.filter(b => b.currentQty > 0).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
        
        let remainingDemand = dailyDemand;
        for (let b of medBatches) {
          if (remainingDemand <= 0) break;
          let take = Math.min(b.currentQty, remainingDemand);
          b.currentQty -= take;
          remainingDemand -= take;
        }

        if (remainingDemand > 0) {
          dayEvents.stockouts++;
          if (!results.stockouts.find(s => s.medicineId === med.id)) {
            results.stockouts.push({ medicineId: med.id, day, unmetDemand: remainingDemand });
          }
        }
      });

      results.timeline.push(dayEvents);
    }

    // Final expiry exposure analysis
    currentState.forEach(b => {
      if (b.currentQty > 0) {
        const daysToExpiry = (new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        if (daysToExpiry < 60) {
          results.expiryExposure.push({ batchNumber: b.batchNumber, qty: b.currentQty, value: b.currentQty * b.purchasePrice });
        }
      }
    });

    return { success: true, results, snapshot };
  }
};
