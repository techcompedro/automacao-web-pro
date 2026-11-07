/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Preserve existing installations: never replace an existing local key.
module.exports = function prepareBuild(root = path.resolve(__dirname, '..')) {
  const keyFile = path.join(root, 'src/utils/getPassKey.js');
  if (fs.existsSync(keyFile)) return;

  const key = crypto.randomBytes(32).toString('hex');
  const source = `// Chave local gerada na primeira compilação. Guarde este arquivo.\nexport default function getPassKey() {\n  return '${key}';\n}\n`;
  try {
    fs.writeFileSync(keyFile, source, { flag: 'wx', mode: 0o600 });
    console.info(
      'Configuração local criada. Preserve src/utils/getPassKey.js nas próximas compilações.'
    );
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
};
