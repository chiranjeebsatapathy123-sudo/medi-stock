# MediStock Production Rollback Runbook

## Overview
This runbook describes the procedure to quickly revert the MediStock production environment to the previous stable version in the event of a critical deployment failure.

## Procedure

### 1. Identify the Failure
- Halt the rollout (if in progress).
- Confirm the issue is tied to the current release (check logs, Sentry, Datadog).
- Announce rollback in `#ops-alerts`.

### 2. Traffic Switch (Green -> Blue)
Since we use a Blue/Green deployment strategy, the previous (Blue) environment should still be scaled up during the 15-minute monitoring window.
Revert the service selector to point back to the Blue target group:
```bash
kubectl patch service medistock-backend -p '{"spec":{"selector":{"version":"blue"}}}'
```
Wait 30 seconds and verify that traffic is routing to the old version and error rates are dropping.

### 3. Frontend Rollback
If the frontend was deployed via static edge hosting (e.g., Vercel/Netlify), use the platform dashboard or CLI to instantly revert to the previous deployment ID.
```bash
vercel rollback <PREVIOUS_DEPLOYMENT_ID>
```

### 4. Database Rollback (If Necessary)
**WARNING:** Rolling back a database migration is dangerous and should only be done if the new schema changes actively break the old (Blue) application code.
Ensure that no destructive migrations were executed. If you must revert a migration:
```bash
flyway -url=$DATABASE_URL -user=$DATABASE_USERNAME -password=$DATABASE_PASSWORD undo
```
*Note: Flyway Undo is only available in Teams/Enterprise editions. If using Community, apply a manual rollback SQL script.*

### 5. Verification
- Verify the system health endpoint (`GET /api/health`) reports the previous version.
- Perform a manual smoke test (Login, view inventory, log out).
- Monitor metrics to ensure stability has returned.

### 6. Post-Mortem
- Leave the failed (Green) pods running for a short time to extract debug logs.
- Document the rollback reason and timeline.
- Create an incident report and assign action items to prevent recurrence.
