const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');

function setup(tabs = [], windows = [{ id: 1, focused: true }]) {
  const calls = [];
  const record =
    (name, result) =>
    async (...args) => {
      calls.push({ name, args: JSON.parse(JSON.stringify(args)) });
      return result;
    };
  const browser = {
    runtime: { getURL: (url) => `chrome-extension://webflow${url}` },
    tabs: {
      query: async () => tabs,
      create: record('tabs.create', { id: 10 }),
      move: record('tabs.move'),
      update: record('tabs.update'),
    },
    windows: {
      getAll: async () => windows,
      create: record('windows.create', { id: 20 }),
      update: record('windows.update'),
    },
  };
  const filename = path.resolve(
    __dirname,
    '../src/background/BackgroundUtils.js'
  );
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename,
    configFile: false,
    babelrc: false,
    presets: [
      [
        require.resolve('@babel/preset-env'),
        { targets: { node: 'current' }, modules: 'commonjs' },
      ],
    ],
  });
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    console,
    require: (id) => {
      if (id === 'webextension-polyfill') return browser;
      if (id === '@/workflowEngine/helper') return {};
      throw new Error(id);
    },
  });
  return { open: module.exports.default.openDashboard, calls };
}

test('abre as configurações em uma aba normal sem criar janela', async () => {
  const { open, calls } = setup();
  await open('/settings');
  assert.deepEqual(calls, [
    {
      name: 'tabs.create',
      args: [
        {
          url: 'chrome-extension://webflow/newtab.html#/settings',
          windowId: 1,
          active: true,
        },
      ],
    },
    { name: 'windows.update', args: [1, { focused: true }] },
  ]);
});

test('reutiliza o painel existente sem maximizar ou redimensionar a janela', async () => {
  const { open, calls } = setup([{ id: 3, windowId: 1 }]);
  await open('/backup');
  assert.deepEqual(calls, [
    {
      name: 'tabs.update',
      args: [
        3,
        { active: true, url: 'chrome-extension://webflow/newtab.html#/backup' },
      ],
    },
    { name: 'windows.update', args: [1, { focused: true }] },
  ]);
});

test('move o painel antigo da janela popup para o navegador', async () => {
  const { open, calls } = setup([{ id: 3, windowId: 99 }]);
  await open('/settings');
  assert.deepEqual(calls[0], {
    name: 'tabs.move',
    args: [3, { windowId: 1, index: -1 }],
  });
  assert.equal(
    calls.some((call) => call.name === 'windows.create'),
    false
  );
});

test('prefere uma aba normal existente a um popup antigo', async () => {
  const { open, calls } = setup([
    { id: 3, windowId: 99 },
    { id: 4, windowId: 1 },
  ]);
  await open('/settings');
  assert.equal(calls[0].name, 'tabs.update');
  assert.equal(calls[0].args[0], 4);
});

test('abertura em segundo plano não muda o foco nem a rota de uma aba existente', async () => {
  const existing = setup([{ id: 3, windowId: 1 }]);
  await existing.open('', false);
  assert.deepEqual(existing.calls, []);
  const fresh = setup();
  await fresh.open('', false);
  assert.equal(fresh.calls[0].args[0].active, false);
  assert.equal(fresh.calls.length, 1);
});

test('sem janela normal disponível, cria uma janela normal sem tamanho forçado', async () => {
  const { open, calls } = setup([{ id: 3, windowId: 99 }], []);
  await open('/settings');
  assert.deepEqual(calls[0], {
    name: 'windows.create',
    args: [{ tabId: 3, type: 'normal', focused: true }],
  });
});
