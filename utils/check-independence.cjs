const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const retired =
  /automa\.site|automa\.vercel\.app|twitter\.com\/AutomaApp|discord\.gg\/C6khwwTE84|UCL3qU64hW0fsIj2vOayOQUQ|repositories\/412741449/i;
let checked = 0;
function scan(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) scan(file);
    else if (/\.(?:js|vue|json|html|svg|css)$/.test(file)) {
      assert.equal(
        retired.test(fs.readFileSync(file, 'utf8')),
        false,
        `Conexão antiga em ${path.relative(root, file)}`
      );
      checked += 1;
    }
  }
}
scan(path.join(root, 'src'));
const build = path.join(root, 'build');
if (fs.existsSync(build)) {
  scan(build);
  assert.equal(fs.existsSync(path.join(build, 'webService.bundle.js')), false);
}
for (const file of [
  'manifest.chrome.json',
  'manifest.chrome.dev.json',
  'manifest.firefox.json',
]) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, 'src', file), 'utf8')
  );
  assert.ok(
    manifest.content_scripts.every(
      (item) => !item.js.includes('webService.bundle.js')
    )
  );
}
console.log(
  `${checked} arquivos verificados: sem endereços dos serviços de origem ou conector com o site.`
);
