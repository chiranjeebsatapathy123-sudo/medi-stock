# MediStock Database Restore Runbook

## Overview
This runbook details the steps required to restore the MediStock PostgreSQL production database from a backup in the event of a catastrophic failure, data corruption, or accidental deletion.

## Prerequisites
- Administrative access to the target PostgreSQL database cluster.
- Access to the secure backup storage bucket (`s3://medistock-prod-backups`).
- `pg_restore` utility matching the version of the target database (PostgreSQL 15+).

## Procedure

### 1. Identify the Correct Backup
Locate the most recent verified healthy backup from the storage bucket:
```bash
aws s3 ls s3://medistock-prod-backups/daily/ --recursive | sort | tail -n 1
```

### 2. Download and Decrypt the Backup
```bash
aws s3 cp s3://medistock-prod-backups/daily/medistock_prod_2026-10-01.dump .
```

### 3. Stop Application Traffic (Important)
Ensure no applications are attempting to write to the database during restore.
- Scale down the application deployment:
  ```bash
  kubectl scale deployment medistock-backend --replicas=0
  ```

### 4. Prepare the Target Database
If restoring to an existing cluster, you must terminate existing connections and drop the database to ensure a clean state:
```sql
-- Connect to the 'postgres' database as superuser
REVOKE CONNECT ON DATABASE medistock_prod FROM public;
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'medistock_prod' AND pid <> pg_backend_pid();

DROP DATABASE medistock_prod;
CREATE DATABASE medistock_prod;
```

### 5. Execute Restore
Use `pg_restore` to restore the schema and data:
```bash
pg_restore -d medistock_prod -U postgres -h <db_host> -p 5432 -1 --clean --if-exists medistock_prod_2026-10-01.dump
```
*(The `-1` flag ensures the restore runs in a single transaction, rolling back on failure)*

### 6. Verification
1. Re-connect to the database.
2. Run integrity queries:
```sql
SELECT count(*) FROM users;
SELECT count(*) FROM inventory_movements;
```
3. Verify Flyway migration history:
```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;
```

### 7. Restore Application Traffic
- Scale the backend back up:
  ```bash
  kubectl scale deployment medistock-backend --replicas=3
  ```

### 8. Post-Incident Review
Create an incident report documenting the root cause, downtime, and time-to-recovery (RTO).
