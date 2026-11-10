#!/usr/bin/env python3
"""Purpose-fit verification for FootballTransferManager.

Runs the Maven test suite and a live boot smoke: starts the Spring Boot
app on its own port and checks the players API answers. Exit 0 and
FAILURES=0 mean green.
"""
import http.client
import json
import os
import re
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import time

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))


def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

checks = []
failures = []


def record(name, ok, detail=''):
    checks.append({'name': name, 'ok': bool(ok), 'detail': detail})
    print(('PASS' if ok else 'FAIL') + ' ' + name + (' :: ' + detail if detail else ''))
    if not ok:
        failures.append(name)


def java_ok():
    try:
        out = subprocess.run(['java', '-version'], capture_output=True, text=True).stderr
        for token in out.split('"')[1:2][0].replace('+', '').split('.'):
            pass
        major = out.split('"')[1].split('.')[0]
        return int(major) >= 17, out.split('\n')[0]
    except Exception as e:
        return False, str(e)


def main():
    ok, detail = java_ok()
    record('doctor: JDK 17+ on PATH (or JAVA_HOME)', ok, detail)
    record('doctor: maven on PATH', shutil.which('mvn') is not None, shutil.which('mvn') or 'not found')
    if failures:
        return finish()

    test = subprocess.run(['mvn', '-B', 'test'], cwd=REPO_ROOT,
                          capture_output=True, text=True, timeout=600)
    counts = [int(m) for m in re.findall(r'Tests run: (\d+),', test.stdout + test.stderr)]
    record('maven test suite green', test.returncode == 0,
           ('%d tests run' % sum(counts)) if counts else 'rc=%d' % test.returncode)

    port = free_port()
    env = dict(os.environ)
    env['SERVER_PORT'] = str(port)
    proc = subprocess.Popen(['mvn', '-q', 'spring-boot:run'], cwd=REPO_ROOT, env=env,
                            stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT,
                            start_new_session=True)
    try:
        up = False
        deadline = time.time() + 90
        while time.time() < deadline:
            if proc.poll() is not None:
                break
            try:
                conn = http.client.HTTPConnection('127.0.0.1', port, timeout=3)
                conn.request('GET', '/api/v1/players')
                resp = conn.getresponse()
                body = resp.read().decode('utf-8', 'replace')
                conn.close()
                if resp.status == 200:
                    up = True
                    break
            except OSError:
                time.sleep(1.5)
        record('boot smoke: /api/v1/players answers 200', up,
               ('players API answered' if up else 'app did not come up in 90s'))
    finally:
        try:
            os.killpg(proc.pid, signal.SIGTERM)
            proc.wait(timeout=10)
        except Exception:
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except Exception:
                pass
    return finish()


def finish():
    evidence_dir = tempfile.mkdtemp(prefix='verify-football-transfer-manager-')
    with open(os.path.join(evidence_dir, 'evidence.json'), 'w') as f:
        json.dump({'repo': 'FootballTransferManager', 'checks': checks, 'failures': failures}, f, indent=2)
    print('EVIDENCE_DIR=' + evidence_dir)
    print('FAILURES=%d' % len(failures))
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
