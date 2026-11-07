const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const prepareBuild = require('./prepare-build');
const validateExtension = require('./validate-extension');

function temporary(t) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'web-flow-test-'));
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
  return folder;
}

test('uma nova compilação preserva a chave de instalações existentes', (t) => {
  const root = temporary(t);
  const utils = path.join(root, 'src/utils');
  fs.mkdirSync(utils, { recursive: true });
  prepareBuild(root);
  const keyFile = path.join(utils, 'getPassKey.js');
  const first = fs.readFileSync(keyFile, 'utf8');
  assert.match(first, /return '[0-9a-f]{64}'/);
  prepareBuild(root);
  assert.equal(fs.readFileSync(keyFile, 'utf8'), first);
  fs.writeFileSync(keyFile, '// chave personalizada anterior');
  prepareBuild(root);
  assert.equal(
    fs.readFileSync(keyFile, 'utf8'),
    '// chave personalizada anterior'
  );
});

test('a pasta do código-fonte é rejeitada com orientação de compilação', (t) => {
  assert.throws(
    () => validateExtension(temporary(t)),
    /Manifesto ausente.*build\//
  );
});

test('o pacote precisa de manifesto, versão válida e todos os arquivos locais', (t) => {
  const root = temporary(t);
  const manifest = {
    manifest_version: 3,
    name: 'Web Flow',
    version: '1.30.1',
    action: { default_popup: 'popup.html' },
    background: { service_worker: 'background.bundle.js' },
    content_scripts: [{ matches: ['<all_urls>'], js: ['content.bundle.js'] }],
  };
  const save = () =>
    fs.writeFileSync(
      path.join(root, 'manifest.json'),
      JSON.stringify(manifest)
    );
  save();
  assert.throws(() => validateExtension(root), /Arquivo da extensão ausente/);
  fs.writeFileSync(
    path.join(root, 'popup.html'),
    '<script src="popup.bundle.js"></script>'
  );
  for (const file of ['background.bundle.js', 'content.bundle.js'])
    fs.writeFileSync(path.join(root, file), '');
  assert.throws(
    () => validateExtension(root),
    /Recurso ausente.*popup.bundle.js/
  );
  fs.writeFileSync(path.join(root, 'popup.bundle.js'), '');
  assert.equal(validateExtension(root).name, 'Web Flow');
  manifest.version = '1.30.00';
  save();
  assert.throws(() => validateExtension(root), /Versão inválida/);
});
