/**
 * Publish project source to the user's Luxury_Presence repository safely.
 * Supports both the initial commit and later fixes; does not force-push,
 * delete unrelated files, or touch a working Git checkout.
 */
import { cpSync, existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoUrl = process.env.GITHUB_REPO_URL ||
  'https://github.com/christiandavemaullon0-ai/Luxury_Presence.git';
const workspace = mkdtempSync(path.join(tmpdir(), 'luxury-presence-upload-'));
const target = path.join(workspace, 'repo');
const commitMessage = 'fix: repair anchor navigation, mobile menu and photo gallery';

function run(command, args, cwd = project, capture = false) {
  const result = spawnSync(command, args, { cwd, stdio: capture ? 'pipe' : 'inherit',
    encoding: capture ? 'utf8' : undefined, shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (code ${result.status})${capture ? ': '+result.stderr : ''}`);
  return capture ? result.stdout.trim() : '';
}

try {
  console.log(`Cloning ${repoUrl} into a temporary directory...`);
  run('git', ['clone', repoUrl, target]);
  const paths = ['index.html', 'package.json', 'vercel.json', '.gitignore',
    'IMPLEMENTATION_NOTE.md', 'original-image-manifest.json', 'src', 'public', 'scripts'];
  if (existsSync(path.join(project, 'package-lock.json'))) paths.push('package-lock.json');

  // Preserve the repository's general README and put website documentation
  // under a separate name, consistent with the initial upload script.
  const siteReadme = path.join(project, 'README.md');
  if (existsSync(siteReadme)) {
    cpSync(siteReadme, path.join(target, 'HOMEPAGE_README.md'), {force:true});
    paths.push('HOMEPAGE_README.md');
  }
  for (const name of paths) {
    if (name === 'HOMEPAGE_README.md') continue;
    const source = path.join(project, name);
    if (existsSync(source)) cpSync(source, path.join(target, name), {recursive:true, force:true});
  }
  run('git', ['add', '--', ...paths], target);
  console.log('\nChanges ready to push:');
  run('git', ['diff', '--cached', '--stat'], target);
  if (!run('git', ['diff', '--cached', '--name-only'], target, true)) {
    console.log('No changes to push; repository is up-to-date.');
    process.exit(0);
  }
  run('git', ['commit', '-m', commitMessage], target);
  run('git', ['push', 'origin', 'HEAD'], target);
  console.log(`\nSUCCESS: pushed fixes to ${repoUrl.replace(/\.git$/, '')}`);
} catch (error) {
  console.error(`\nPush stopped: ${error.message}`);
  console.error('No force-push was attempted; review the error before retrying.');
  console.error(`Temporary checkout: ${target}`);
  process.exitCode = 1;
}
