const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

function load(file, stubs = {}, globals = {}) {
  const filename = path.resolve(__dirname, '..', file);
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename,
    babelrc: false,
    configFile: false,
    presets: [
      [
        require.resolve('@babel/preset-env'),
        { targets: { node: 'current' }, modules: 'commonjs' },
      ],
    ],
  });
  const module = { exports: {} };
  vm.runInNewContext(
    code,
    {
      module,
      exports: module.exports,
      console,
      require(id) {
        if (Object.hasOwn(stubs, id)) return stubs[id];
        throw new Error(`Dependência inesperada: ${id}`);
      },
      ...globals,
    },
    { filename }
  );
  return module.exports;
}

test('carregar o perfil não consulta uma conta e preserva os dados locais', async () => {
  const removed = [];
  const definition = load('src/stores/user.js', {
    pinia: { defineStore: (_id, options) => options },
    'webextension-polyfill': {
      storage: { local: { remove: async (keys) => removed.push(...keys) } },
    },
  }).useUserStore;
  const state = definition.state();
  state.user = { id: 'conta-antiga', teams: [{ id: 1, access: ['owner'] }] };
  await definition.actions.loadUser.call(state);
  assert.equal(state.user, null);
  assert.equal(state.retrieved, true);
  assert.deepEqual(removed, ['session', 'user']);
  assert.equal(
    definition.getters.validateTeamAccess(state)(1, ['owner']),
    false
  );
});

test('requisições de conta são bloqueadas antes de ler sessão ou acessar a rede', async () => {
  const policy = load('src/utils/accountPolicy.js');
  let storageReads = 0;
  let networkRequests = 0;
  const api = load(
    'src/utils/api.js',
    {
      '@/service/browser-api/BrowserAPIService': {
        storage: {
          local: {
            get: async () => {
              storageReads += 1;
              return {};
            },
          },
        },
      },
      secrets: { baseApiUrl: 'https://example.invalid' },
      './helper': {},
      './accountPolicy': policy,
    },
    {
      fetch: async () => {
        networkRequests += 1;
        return { ok: true };
      },
    }
  );
  assert.equal(policy.accountFeaturesEnabled, false);
  for (const [url, options] of [
    ['/me', {}],
    ['/teams/1/workflows', {}],
    ['/workflows/hosted', { auth: true }],
  ]) {
    await assert.rejects(api.fetchApi(url, options), {
      code: 'ACCOUNT_FEATURES_DISABLED',
    });
  }
  assert.equal(storageReads, 0);
  assert.equal(networkRequests, 0);
  await assert.rejects(api.fetchApi('/public'), {
    code: 'ACCOUNT_FEATURES_DISABLED',
  });
  assert.equal(networkRequests, 0);
});

test('serviço de IA e seletor hospedado não fazem requisições nem abrem sites', async () => {
  const policy = load('src/utils/accountPolicy.js');
  let requests = 0;
  const api = load(
    'src/utils/getAIPoweredInfo.js',
    {
      secrets: { apApiUrl: 'https://example.invalid' },
      './accountPolicy': policy,
    },
    {
      fetch: async () => {
        requests += 1;
      },
    }
  );
  for (const call of Object.values(api)) {
    await assert.rejects(call({}, 'token'), {
      code: 'ACCOUNT_FEATURES_DISABLED',
    });
  }
  const picker = load(
    'src/utils/openGDriveFilePicker.js',
    {
      'webextension-polyfill': {},
    },
    {
      window: {
        open: () => {
          requests += 1;
        },
      },
    }
  );
  await assert.rejects(
    picker.openGDrivePickerPopup('token'),
    /seletor hospedado foi removido/
  );
  assert.equal(requests, 0);
});
