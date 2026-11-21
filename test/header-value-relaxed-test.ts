import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

// The markdown fixtures pass inputs via argv, which cannot contain NUL bytes.
// Use a native test with explicit buffer lengths and an external watchdog.
test('header value validation rejects NUL without looping', () => {
  const root = path.join(__dirname, '..');
  const build = path.join(root, 'build');
  const tmp = path.join(__dirname, 'tmp');
  mkdirSync(tmp, { recursive: true });

  const generated = spawnSync(process.execPath,
    [ '--import', 'tsx', 'bin/generate.ts' ], {
      cwd: root,
      encoding: 'utf8',
      timeout: 60000,
    });
  assert.ifError(generated.error);
  assert.strictEqual(generated.status, 0, generated.stderr);

  const variants = [ { name: 'scalar', flags: [] as string[] } ];
  if (process.arch === 'x64' || process.arch === 'ia32') {
    variants.push({ name: 'sse42', flags: [ '-msse4.2' ] });
  }

  for (const { name, flags } of variants) {
    const executable = path.join(tmp,
      `header-value-relaxed-${name}${process.platform === 'win32' ? '.exe' : ''}`);
    const compiled = spawnSync(process.env.CLANG || 'clang', [
      '-O2', '-Wall', '-Wextra', '-Wno-unused-parameter',
      ...flags,
      '-I', build,
      path.join(build, 'c', 'llhttp.c'),
      path.join(root, 'src', 'native', 'api.c'),
      path.join(root, 'src', 'native', 'http.c'),
      path.join(__dirname, 'fixtures', 'header-value-relaxed.c'),
      '-o', executable,
    ], { encoding: 'utf8', timeout: 60000 });
    assert.ifError(compiled.error);
    assert.strictEqual(compiled.status, 0, compiled.stderr);

    const result = spawnSync(executable, [], {
      encoding: 'utf8',
      timeout: 10000,
      killSignal: 'SIGKILL',
    });
    assert.ifError(result.error);
    assert.strictEqual(result.status, 0, `${name}: ${result.stderr}`);
    assert.match(result.stdout, /header value byte and buffer-boundary checks passed/);
  }
});
