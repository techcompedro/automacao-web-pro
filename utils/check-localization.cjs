/* Verify translation coverage and runtime placeholders without dependencies. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
function flatten(value, prefix = '', output = {}) {
  for (const [key, item] of Object.entries(value)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (item !== null && typeof item === 'object') flatten(item, name, output);
    else output[name] = item;
  }
  return output;
}
const placeholders = (text) =>
  [...new Set(String(text).match(/\{\s*[\w]+\s*\}/g) || [])].sort();
const translated = {};
let count = 0;
for (const file of [
  'common.json',
  'newtab.json',
  'popup.json',
  'blocks.json',
]) {
  const source = flatten(json(`src/locales/en/${file}`));
  const target = flatten(json(`src/locales/pt-BR/${file}`));
  Object.assign(translated, target);
  for (const [key, value] of Object.entries(source)) {
    assert.ok(Object.hasOwn(target, key), `Tradução ausente: ${file}:${key}`);
    assert.equal(typeof target[key], typeof value, `Tipo incompatível: ${key}`);
    assert.deepEqual(
      placeholders(target[key]),
      placeholders(value),
      `Parâmetros incompatíveis: ${file}:${key}`
    );
    count += 1;
  }
}
for (const [key, value] of Object.entries(translated)) {
  for (const match of String(value).matchAll(/@(?:\.[\w]+)?:([\w.-]+)/g)) {
    assert.ok(
      Object.hasOwn(translated, match[1]),
      `Referência inválida: ${key} → ${match[1]}`
    );
  }
}
for (const file of [
  'manifest.chrome.json',
  'manifest.chrome.dev.json',
  'manifest.firefox.json',
]) {
  const manifest = json(`src/${file}`);
  assert.ok(manifest.name.startsWith('Web Flow'), `Nome inválido: ${file}`);
  assert.ok(
    manifest.description.length <= 132,
    `Descrição muito longa: ${file}`
  );
  const icons = Object.values(manifest.icons);
  for (const icon of icons) {
    const data = fs.readFileSync(path.join(root, 'src/assets/images', icon));
    assert.equal(data.subarray(1, 4).toString(), 'PNG');
    assert.equal(data.readUInt32BE(16), 128);
    assert.equal(data.readUInt32BE(20), 128);
  }
}
assert.equal(
  read('src/assets/svg/logo.svg'),
  read('src/assets/svg/web-flow.svg')
);
assert.equal(
  read('src/assets/svg/logoFirefox.svg'),
  read('src/assets/svg/web-flow.svg')
);
assert.match(read('src/stores/main.js'), /locale: 'pt-BR'/);
assert.match(read('src/lib/vueI18n.js'), /fallbackLocale: 'pt-BR'/);
console.log(
  `Web Flow: ${count} entradas verificadas; parâmetros, referências, nomes e ícones válidos.`
);
