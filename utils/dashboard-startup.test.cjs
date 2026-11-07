const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

// Execute the actual page bootstrap, including its readiness and data loading.
const file =
  process.env.WEBFLOW_STARTUP_SOURCE ||
  path.resolve(__dirname, '../src/newtab/App.vue');
const source = fs
  .readFileSync(file, 'utf8')
  .split('<script setup>')[1]
  .split('</script>')[0];
const ast = babel.parseSync(source, {
  sourceType: 'module',
  configFile: false,
  babelrc: false,
});
const bootstrap = ast.program.body.find(
  (node) =>
    node.type === 'ExpressionStatement' &&
    node.expression.type === 'CallExpression' &&
    node.expression.callee.type === 'ArrowFunctionExpression' &&
    node.expression.callee.async
);
assert.ok(bootstrap, 'Inicialização do painel não encontrada');
const script = source.slice(bootstrap.start, bootstrap.end);

for (const count of [1, 2]) {
  test(`inicializa em aba normal sem fechar nenhuma das ${count} abas existentes`, async () => {
    const removed = [];
    const focused = [];
    const errors = [];
    const loaded = [];
    const retrieved = { value: false };
    const load = (name) => async () => loaded.push(name);
    const tabs = Array.from({ length: count }, (_, id) => ({
      id: id + 1,
      windowId: 1,
    }));
    const workflowStore = { loadData: load('workflows'), states: {} };
    const context = {
      console: { error: (error) => errors.push(error) },
      browser: {
        storage: {
          local: {
            get: async () => ({
              isFirstTime: true,
              workflowStates: {},
              isRecording: false,
            }),
          },
        },
        runtime: { getURL: (url) => `chrome-extension://webflow${url}` },
        tabs: {
          query: async () => tabs,
          remove: async (ids) => removed.push(...ids),
          update: async (...args) => focused.push(args),
        },
        windows: {
          getCurrent: async () => ({ id: 1, type: 'normal' }),
          update: async (...args) => focused.push(args),
        },
      },
      workflowStore,
      folderStore: { load: load('folders') },
      store: { settings: { locale: 'pt-BR' }, loadSettings: load('settings') },
      teamWorkflowStore: { loadData: load('team-cache') },
      hostedWorkflowStore: { loadData: load('host-cache') },
      packageStore: { loadData: load('packages') },
      userStore: { loadUser: load('local-mode') },
      loadLocaleMessages: load('translations'),
      setI18nLanguage: load('language'),
      dataMigration: load('migration'),
      automa: load('business-hook'),
      autoDeleteLogs: () => {},
      retrieved,
      isUpdated: { value: false },
      currentVersion: '1.30.4',
      prevVersion: '1.30.3',
      compare: () => true,
      router: { push: async () => {} },
      localStorage: { setItem: () => {} },
    };
    await vm.runInNewContext(script, context);
    assert.deepEqual(errors, []);
    assert.deepEqual(
      removed,
      [],
      'A inicialização não pode fechar o painel nem outras abas'
    );
    assert.deepEqual(focused, []);
    assert.equal(retrieved.value, true);
    for (const name of [
      'workflows',
      'settings',
      'translations',
      'migration',
      'local-mode',
    ]) {
      assert.ok(loaded.includes(name), `Etapa não executada: ${name}`);
    }
  });
}
