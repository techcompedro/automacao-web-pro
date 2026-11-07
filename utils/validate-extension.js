/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function validateExtension(directory) {
  const root = path.resolve(directory);
  const manifestPath = path.join(root, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `Manifesto ausente em ${root}. Compile o projeto e selecione a pasta build/ ou extraia o ZIP instalável.`
    );
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (![2, 3].includes(manifest.manifest_version))
    throw new Error('Versão de manifesto inválida.');
  if (
    !/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){0,3}$/.test(manifest.version) ||
    manifest.version.split('.').some((n) => +n > 65535)
  ) {
    throw new Error(`Versão inválida para o navegador: ${manifest.version}`);
  }
  const files = new Set(Object.values(manifest.icons || {}));
  const action = manifest.action || manifest.browser_action || {};
  if (action.default_popup) files.add(action.default_popup);
  if (typeof action.default_icon === 'string') files.add(action.default_icon);
  else
    Object.values(action.default_icon || {}).forEach((file) => files.add(file));
  if (manifest.background?.service_worker)
    files.add(manifest.background.service_worker);
  (manifest.background?.scripts || []).forEach((file) => files.add(file));
  (manifest.content_scripts || []).forEach((item) => {
    [...(item.js || []), ...(item.css || [])].forEach((file) =>
      files.add(file)
    );
  });
  (manifest.sandbox?.pages || []).forEach((file) => files.add(file));
  // Check all HTML entry points and their emitted scripts/styles, including the dashboard.
  fs.readdirSync(root)
    .filter((file) => file.endsWith('.html'))
    .forEach((file) => files.add(file));
  for (const file of files) {
    const absolute = path.resolve(root, file.replace(/^\//, ''));
    if (
      !absolute.startsWith(`${root}${path.sep}`) ||
      !fs.statSync(absolute, { throwIfNoEntry: false })?.isFile()
    ) {
      throw new Error(`Arquivo da extensão ausente: ${file}`);
    }
    if (file.endsWith('.html')) {
      const html = fs.readFileSync(absolute, 'utf8');
      for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
        const ref = match[1];
        if (!/^(?:[a-z]+:|#|\/\/)/i.test(ref)) {
          const asset = ref.startsWith('/')
            ? path.join(root, ref.slice(1))
            : path.resolve(path.dirname(absolute), ref);
          if (!fs.existsSync(asset.split(/[?#]/)[0]))
            throw new Error(`Recurso ausente em ${file}: ${ref}`);
        }
      }
    }
  }
  return manifest;
}

if (require.main === module) {
  try {
    const folder = path.resolve(
      process.argv[2] || path.join(__dirname, '../build')
    );
    const manifest = validateExtension(folder);
    console.info(
      `${manifest.name} ${manifest.version}: manifesto e arquivos verificados em ${folder}`
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = validateExtension;
