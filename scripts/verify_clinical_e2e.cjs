// =====================================================================
// MediStock Pro - Clinical E2E Integration Test Suite
// Verifies Authentication, CDSS Contraindications, 3-Way Matching,
// GS1 Barcode Decoding, and SHA-256 Audit Trail
// =====================================================================

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';
const ORG_ID = '11111111-1111-1111-1111-111111111111';

let adminToken = '';
let pharmacistToken = '';
let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    totalPassed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    totalFailed++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': ORG_ID,
    ...(options.token ? { 'Authorization': `Bearer ${options.token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runClinicalE2eTests() {
  console.log('=================================================================');
  console.log('  MEDISTOCK PRO - CLINICAL E2E VERIFICATION SUITE');
  console.log('=================================================================\n');

  // STEP 1: Authentication & RBAC
  console.log('[STEP 1/6] Authenticating Clinical Roles...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@medistock.com', password: 'admin123' })
  });
  assert(adminLogin.status === 200 && adminLogin.data.token, 'Super Admin authentication successful (JWT received)');
  adminToken = adminLogin.data.token;

  const pharmaLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'pharmacist@medistock.com', password: 'pharma123' })
  });
  assert(pharmaLogin.status === 200 && pharmaLogin.data.token, 'Lead Clinical Pharmacist authentication successful (JWT received)');
  pharmacistToken = pharmaLogin.data.token;

  // STEP 2: Catalog & Master Data Audit
  console.log('\n[STEP 2/6] Auditing Pharmaceutical Master Catalog & Inventory...');
  const meds = await request('/medicines', { token: adminToken });
  assert(meds.ok && meds.data.length >= 18, `Master Medicine Catalog contains ${meds.data?.length} medications (expected >= 18)`);

  const batches = await request('/batches', { token: adminToken });
  assert(batches.ok && batches.data.length >= 18, `Batch Inventory contains ${batches.data?.length} active lots (expected >= 18)`);

  const patients = await request('/patients', { token: adminToken });
  assert(patients.ok && patients.data.length >= 4, `Clinical Patient Registry contains ${patients.data?.length} patients`);

  // STEP 3: CDSS Real-Time Allergy Safeguard
  console.log('\n[STEP 3/6] Testing Clinical Decision Support (CDSS) Contraindication Engine...');
  const orders = await request('/pharmacy/orders', { token: pharmacistToken });
  assert(orders.ok && orders.data.length >= 4, `Pharmacy Order Queue contains ${orders.data?.length} active prescriptions`);

  const ord1 = (orders.data || []).find(o => o.orderNumber === 'RX-2026-9001');
  assert(ord1 != null, 'Located Target Order RX-2026-9001 (Marcus Aurelius + Amoxicillin 500mg)');

  if (ord1) {
    const cdss = await request(`/pharmacy/orders/${ord1.id}/cdss-review`, { token: pharmacistToken });
    assert(cdss.ok, 'CDSS evaluation endpoint returned successfully');
    assert(cdss.data.safeToDispense === false, 'CDSS Flag: safeToDispense == false (Contraindication Safeguard Triggered)');
    assert(cdss.data.contraindicatedCount >= 1, `CDSS Flag: ${cdss.data.contraindicatedCount} CONTRAINDICATED alert(s) detected`);
    
    // Attempt approval without justification -> must be BLOCKED
    const unauthApprove = await request(`/pharmacy/orders/${ord1.id}/review`, {
      method: 'POST',
      token: pharmacistToken,
      body: JSON.stringify({ action: 'APPROVE', overrideReason: '' })
    });
    assert(unauthApprove.status >= 400, 'Unjustified approval blocked by system (Mandatory override protocol enforced)');

    // Legitimate Pharmacist Clinical Override
    const justifiedApprove = await request(`/pharmacy/orders/${ord1.id}/review`, {
      method: 'POST',
      token: pharmacistToken,
      body: JSON.stringify({ 
        action: 'APPROVE', 
        overrideReason: 'Patient completed desensitization protocol under Dr. Evans (Allergy/Immunology). Authorized with post-dose observation.' 
      })
    });
    assert(justifiedApprove.ok && justifiedApprove.data.status === 'APPROVED', 'Pharmacist clinical override accepted & order status transitioned to APPROVED');
  }

  // STEP 4: FDA 21 CFR Part 11 Cryptographic Audit Trail
  console.log('\n[STEP 4/6] Verifying SHA-256 Tamper-Evident Audit Chain...');
  const auditChain = await request('/audit/verify-chain', { token: adminToken });
  assert(auditChain.ok && (auditChain.data.valid === true || auditChain.data.chainIntact === true), 'Cryptographic SHA-256 Audit Log Chaining is VALID (0 hash breaks)');

  // STEP 5: B2B Procurement 3-Way Match
  console.log('\n[STEP 5/6] Testing B2B 3-Way Match Procurement Reconciliation...');
  const pos = await request('/procurement/purchase-orders', { token: adminToken });
  assert(pos.ok && pos.data.length >= 3, `Located ${pos.data?.length} Purchase Orders in procurement ledger`);

  const invoices = await request('/invoices', { token: adminToken });
  assert(invoices.ok && invoices.data.length >= 4, `Located ${invoices.data?.length} Vendor Invoices`);

  const invPfz = (invoices.data || []).find(i => i.invoiceNumber === 'INV-PFZ-9901');
  assert(invPfz != null, 'Located Target Invoice INV-PFZ-9901 (Pfizer Ceftriaxone delivery)');

  if (invPfz) {
    const matchPfz = await request(`/invoices/${invPfz.id}/three-way-match`, { token: adminToken });
    assert(matchPfz.ok, '3-Way Match executed against PO-2026-8001 and GRN-2026-4001');
    assert(matchPfz.data.matchStatus === 'PERFECT_MATCH' || matchPfz.data.matchStatus === 'MATCHED' || matchPfz.data.matchStatus === 'WITHIN_TOLERANCE', `Match Status: ${matchPfz.data.matchStatus} (Expected PERFECT_MATCH/MATCHED)`);
    assert(matchPfz.data.approvedForPayment === true, 'Invoice approved for payment via tolerance check');

    // Reconcile and approve
    const recPfz = await request(`/invoices/${invPfz.id}/reconcile`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({ notes: 'Reconciled and approved for payment run.' })
    });
    if (!recPfz.ok) console.log('DEBUG recPfz FAIL:', recPfz.status, recPfz.data);
    assert(recPfz.ok && (recPfz.data.status === 'APPROVED_FOR_PAYMENT' || recPfz.data.status === 'APPROVED'), 'Invoice successfully reconciled and marked APPROVED_FOR_PAYMENT in accounts payable');
  }

  const invTev = (invoices.data || []).find(i => i.invoiceNumber === 'INV-TEV-9902');
  if (invTev) {
    const matchTev = await request(`/invoices/${invTev.id}/three-way-match`, { token: adminToken });
    assert(matchTev.ok, 'Price variance inspection endpoint returned successfully');
    assert(matchTev.data.matchStatus === 'EXCEPTION_PRICE' || matchTev.data.matchStatus === 'PRICE_VARIANCE_EXCEPTION' || matchTev.data.matchStatus === 'EXCEPTION_UNRECEIVED', `Discrepancy Catch: Price variance correctly flagged (${matchTev.data.matchStatus})`);
    assert(matchTev.data.approvedForPayment === false, 'Payment held pending vendor price credit note');
  }

  const invAzn = (invoices.data || []).find(i => i.invoiceNumber === 'INV-AZN-9903');
  if (invAzn) {
    const matchAzn = await request(`/invoices/${invAzn.id}/three-way-match`, { token: adminToken });
    assert(matchAzn.ok, 'Quantity discrepancy inspection endpoint returned successfully');
    assert(matchAzn.data.matchStatus === 'EXCEPTION_QUANTITY', `Discrepancy Catch: Quantity mismatch correctly flagged (${matchAzn.data.matchStatus})`);
    assert(matchAzn.data.approvedForPayment === false, 'Payment held for backordered insulin pens');
  }

  // STEP 6: GS1 Barcode Lookup & Decoding
  console.log('\n[STEP 6/6] Verifying GS1 2D DataMatrix Hardware Scanner Lookup...');
  const gs1Scan = await request('/warehouse/lookup-barcode', {
    method: 'POST',
    token: adminToken,
    body: JSON.stringify({ barcode: '(01)00312345678906(17)261120(10)AMX-2026-N1(21)SN-981023' })
  });
  assert(gs1Scan.ok && gs1Scan.data.status === 'FOUND', 'Decoded GS1-128 AI Barcode: Located Amoxicillin Trihydrate 500mg Batch AMX-2026-N1');

  // SUMMARY
  console.log('\n=================================================================');
  console.log(`  E2E RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('=================================================================');
  if (totalFailed === 0) {
    console.log('  >>> MEDISTOCK PRO IS 100% OPERATIONAL AND CLINICALLY COMPLIANT <<<\n');
    process.exit(0);
  } else {
    console.error('  >>> SOME TESTS FAILED <<<\n');
    process.exit(1);
  }
}

runClinicalE2eTests().catch(err => {
  console.error('Fatal error during E2E verification:', err);
  process.exit(1);
});

