/**
 * Safely clone and publish this assessment project to its GitHub repository.
 *
 * Run: npm run github:push
 * Requires: Git, an authenticated GitHub account with write access.
 * It never deletes or overwrites existing repository files.
 */
import { cpSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoUrl = process.env.GITHUB_REPO_URL ||
  'https://github.com/christiandavemaullon0-ai/Luxury_Presence.git';
const target = path.resolve(project, '..', 'Luxury_Presence_github');
const commitMessage = 'feat: add responsive Marci Metzger homepage redesign';

function run(command, args, cwd = project) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
}

function output(command, args, cwd = project) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.trim());
  return result.stdout.trim();
}

try {
  if (existsSync(target)) {
    throw new Error(`Folder already exists: ${target}\nRename/move it before retrying; no existing files were changed.`);
  }
  console.log(`Cloning ${repoUrl} ...`);
  run('git', ['clone', repoUrl, target]);

  const sources = [
    'index.html', 'package.json', 'vercel.json', '.gitignore',
    'README.md', 'IMPLEMENTATION_NOTE.md', 'original-image-manifest.json',
    'src', 'public', 'scripts',
  ];
  if (existsSync(path.join(project, 'package-lock.json'))) sources.push('package-lock.json');

  // Preserve the repo's existing README (GitHub commonly creates one initially).
  const destinationName = (name) =>
    name === 'README.md' && existsSync(path.join(target, 'README.md'))
      ? 'HOMEPAGE_README.md' : name;
  const filePlan = sources.map((name) => ({ name, destination: destinationName(name) }));
  const collisions = filePlan
    .filter(({ destination }) => existsSync(path.join(target, destination)))
    .map(({ name }) => name);
  if (collisions.length) {
    throw new Error(
      `Repository contains conflicting paths: ${collisions.join(', ')}.\n` +
      `No files were overwritten. Review the clone at ${target} before proceeding.`
    );
  }
  console.log('Copying website files (preserving existing repository files) ...');
  for (const { name, destination } of filePlan) {
    const from = path.join(project, name);
    if (!existsSync(from)) continue;
    const into = path.join(target, destination);
    cpSync(from, into, { recursive: true, force: false, errorOnExist: true });
  }

  console.log('\nFiles staged for commit:');
  run('git', ['add', '--', ...filePlan.map(({ destination }) => destination).filter((name) => existsSync(path.join(target, name)))], target);
  run('git', ['status', '--short'], target);
  if (!output('git', ['diff', '--cached', '--name-only'], target)) {
    console.log('No changes detected. Nothing to push.');
    process.exit(0);
  }
  run('git', ['commit', '-m', commitMessage], target);
  console.log('\nPublishing to GitHub ...');
  run('git', ['push', '-u', 'origin', 'HEAD'], target);
  console.log(`\nSUCCESS. Website source pushed to ${repoUrl.replace(/\.git$/, '')}`);
  console.log(`Local Git clone: ${target}`);
} catch (error) {
  console.error(`\nUpload stopped: ${error.message}`);
  console.error('Nothing was force-pushed; existing GitHub files were not overwritten.');
  process.exitCode = 1;
}
