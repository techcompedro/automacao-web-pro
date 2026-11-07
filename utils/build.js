/* eslint-disable no-console */
// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

require('./prepare-build')();

const webpack = require('webpack');
const validateExtension = require('./validate-extension');
const config = require('../webpack.config');

delete config.chromeExtensionBoilerplate;

config.mode = 'production';

webpack(config, function (err, stats) {
  if (err || stats.hasErrors()) {
    console.error(
      err || stats.toString({ all: false, errors: true, errorDetails: true })
    );
    process.exitCode = 1;
    return;
  }

  try {
    const manifest = validateExtension(config.output.path);
    console.info(
      `${manifest.name} ${manifest.version} compilado. No navegador, selecione a pasta: ${config.output.path}`
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
});
