# MediStock Production Deployment Runbook

## Overview
This runbook covers the standard deployment procedure for the MediStock platform (Frontend and Backend) to the production environment. We utilize a Blue/Green deployment strategy to ensure zero-downtime and safe rollbacks.

## Prerequisites
- Passing CI/CD pipeline for the target commit.
- Verified database migrations (forward and backward tested).
- Approval from the Release Manager.

## Procedure

### 1. Pre-Deployment Checks
- Verify health of the current production environment (`GET /api/health`).
- Ensure no active P1/P2 incidents are open.
- Announce the deployment window in the `#ops-alerts` Slack channel.

### 2. Database Migrations (Run First)
Migrations must be backward compatible.
```bash
# Execute Flyway migrations against the production database
flyway -url=$DATABASE_URL -user=$DATABASE_USERNAME -password=$DATABASE_PASSWORD migrate
```
Verify the migration applied successfully.

### 3. Deploy Backend (Green Environment)
Deploy the new backend image to the 'green' target group.
```bash
kubectl apply -f k8s/backend-deployment-green.yaml
```
Wait for the new pods to report `READY`.
```bash
kubectl get pods -l app=medistock-backend,version=green -w
```
Run smoke tests against the Green environment's internal URL.

### 4. Deploy Frontend (Green Environment)
Deploy the new frontend build to the static hosting/CDN edge.
*(If using Vercel/Netlify, this is handled via deployment URL verification)*

### 5. Traffic Switch (Blue -> Green)
Gradually shift traffic or flip the load balancer target.
```bash
kubectl patch service medistock-backend -p '{"spec":{"selector":{"version":"green"}}}'
```

### 6. Post-Deployment Verification
- Run synthetic monitoring suite against production URL.
- Monitor error rates in Datadog/Sentry for 15 minutes.
- Verify user logins and inventory dashboard loads successfully.

### 7. Clean up (Blue Environment)
If no anomalies are detected within 15 minutes, scale down the old (blue) environment.
```bash
kubectl scale deployment medistock-backend-blue --replicas=0
```

### Rollback
If critical errors occur, immediately revert traffic back to the Blue environment. Refer to `rollback.md` for detailed instructions.
