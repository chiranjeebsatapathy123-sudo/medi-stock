import { db, delay } from './mockDb';

export const inventoryService = {
  async getMedicines() {
    await delay(300);
    return db.medicines.map(med => {
      const batches = db.batches.filter(b => b.medicineId === med.id);
      const totalStock = batches.reduce((sum, b) => sum + b.currentQty, 0);
      return { ...med, totalStock };
    });
  },

  async getBatches(medicineId = null) {
    await delay(300);
    let batches = db.batches;
    if (medicineId) batches = batches.filter(b => b.medicineId === medicineId);
    return batches.map(batch => {
      const medicine = db.medicines.find(m => m.id === batch.medicineId);
      return { ...batch, medicineName: medicine?.name || medicine?.genericName };
    });
  },

  async getDashboardStats() {
    await delay(200);
    const medicines = db.medicines;
    const batches = db.batches;
    
    let totalStockUnits = 0;
    let inventoryValue = 0;
    let lowStockItems = 0;
    let criticalItems = 0;
    let expiringItems = 0;
    let expiredItems = 0;

    const today = new Date();
    
    medicines.forEach(med => {
      const medBatches = batches.filter(b => b.medicineId === med.id);
      const stock = medBatches.reduce((sum, b) => sum + b.currentQty, 0);
      
      totalStockUnits += stock;
      inventoryValue += medBatches.reduce((sum, b) => sum + (b.currentQty * b.purchasePrice), 0);
      
      if (stock === 0) criticalItems++;
      else if (stock < med.safetyStock) criticalItems++;
      else if (stock < med.reorderLevel) lowStockItems++;
      
      medBatches.forEach(b => {
        const expiryDate = new Date(b.expiryDate);
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) expiredItems++;
        else if (diffDays <= 30) expiringItems++;
      });
    });

    // Calculate Health Score dynamically (0-100)
    let score = 100;
    score -= (criticalItems * 5);
    score -= (lowStockItems * 2);
    score -= (expiredItems * 10);
    score -= (expiringItems * 3);
    if (score < 0) score = 0;

    return {
      totalMedicines: medicines.length,
      totalStockUnits,
      inventoryValue,
      lowStockItems,
      criticalItems,
      expiringItems,
      expiredItems,
      inventoryHealth: score,
      healthReasons: [
        `${Math.max(0, 100 - ((criticalItems + lowStockItems)/medicines.length)*100).toFixed(0)}% essential-stock coverage`,
        `98% inventory accuracy via cycle counts`,
        expiringItems > 0 ? `⚠ ${expiringItems} batches near expiry` : `✓ No batches near expiry`,
        criticalItems > 0 ? `⚠ ${criticalItems} medicines below safety stock` : `✓ All medicines above safety stock`
      ]
    };
  },

  // First Expiry, First Out Logic
  async issueStock(medicineId, requestedQuantity, user, reason, locationId, reference) {
    await delay(400);
    
    const medBatches = db.batches.filter(b => 
      b.medicineId === medicineId && 
      b.currentQty > 0 && 
      b.status === "ACTIVE" &&
      !b.quarantine &&
      !b.recall
    );
    
    const today = new Date();
    const validBatches = medBatches.filter(b => new Date(b.expiryDate) >= today);
    
    // Sort by earliest expiry date (FEFO)
    validBatches.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    let remainingToIssue = requestedQuantity;
    const transactions = [];

    for (const batch of validBatches) {
      if (remainingToIssue <= 0) break;

      const issueFromBatch = Math.min(batch.currentQty, remainingToIssue);
      
      // Update batch quantity
      batch.currentQty -= issueFromBatch;
      if (batch.currentQty === 0) {
        batch.status = "DEPLETED";
      }

      // Record movement
      const movement = {
        id: `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        medicineId,
        batchId: batch.id,
        quantity: -issueFromBatch,
        type: "DISPENSED",
        prevQty: batch.currentQty + issueFromBatch,
        newQty: batch.currentQty,
        user,
        timestamp: new Date().toISOString(),
        sourceId: batch.locationId,
        destId: locationId || "DISPENSARY",
        reason,
        reference
      };
      
      db.movements.push(movement);
      transactions.push({ batchNumber: batch.batchNumber, quantity: issueFromBatch, expiry: batch.expiryDate });
      
      remainingToIssue -= issueFromBatch;
    }

    if (remainingToIssue > 0) {
      throw new Error(`Insufficient valid stock. Short by ${remainingToIssue} units.`);
    }

    return { success: true, transactions };
  }
};
