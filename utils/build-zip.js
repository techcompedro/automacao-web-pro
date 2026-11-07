/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const packageJSON = require('../package.json');
const validateExtension = require('./validate-extension');

const browser = process.env.BROWSER || 'chrome';
const appVersion = packageJSON.version;
const fileName = `${packageJSON.name}-${browser}-v${appVersion}.zip`;

const destDir = path.join(__dirname, '../build');
const zipDir = path.join(__dirname, '../build-zip', appVersion);

const manifest = validateExtension(destDir);
if (
  (browser === 'chrome' && manifest.manifest_version !== 3) ||
  (browser === 'firefox' && manifest.manifest_version !== 2)
) {
  throw new Error(
    `A pasta build/ não contém a versão para ${browser}. Compile para o navegador correto antes de gerar o ZIP.`
  );
}

if (!fs.existsSync(zipDir)) {
  fs.mkdirSync(zipDir, { recursive: true });
}

const archive = archiver('zip', { zlib: { level: 9 } });
const stream = fs.createWriteStream(path.join(zipDir, fileName));

archive
  .directory(destDir, false)
  .on('error', (error) => {
    console.error(error);
  })
  .pipe(stream);

stream.on('close', () => console.log('Success'));
archive.finalize();
