---
name: verify-football-transfer-manager
description: Verifies the Football Transfer Manager backend against its promised behavior - the Maven test suite plus a live boot smoke of the players API - with machine-readable evidence.
---

# Verify Football Transfer Manager

## Launch

```bash
# JDK 17+ and Maven required; e.g. JAVA_HOME=/path/to/jdk17 PATH=$JAVA_HOME/bin:$PATH
python3 .cursor/skills/verify-football-transfer-manager/verify.py
```

Exit 0 and `FAILURES=0` mean green. H2 is in-memory; no services needed.

## Doctor

Gates on a JDK 17+ and `mvn` being available, and on port 8080 being free
for the boot smoke (the runner refuses to disturb an occupied port).

## Drive

1. `mvn -B -q test` - the unit and controller test suites.
2. Boot smoke: `mvn spring-boot:run` as a child process, then
   `GET /api/v1/players` must answer 200.

## Evidence

Each run writes a fresh `EVIDENCE_DIR` with `evidence.json`.
`FAILURES=n` is the last line; the exit code mirrors it.

## Cleanup

The boot-smoke server runs in its own process group and is terminated at
the end of the run, pass or fail.

## Maintenance

When the API surface the README promises changes, extend the smoke check
in the same commit.

## Known boundaries

- The React frontend (`frontend/`) is not covered by this skill.
- H2 data is in-memory; the boot smoke checks availability, not seeded
  content.
