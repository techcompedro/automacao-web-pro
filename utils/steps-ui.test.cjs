const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const { parse, compileScript } = require('@vue/compiler-sfc');
const vue = require('vue');
const root = path.resolve(__dirname, '..');
const sequence = import(
  `data:text/javascript;base64,${fs
    .readFileSync(path.join(root, 'src/utils/stepSequence.js'))
    .toString('base64')}`
);

async function setup(disabled = false) {
  const nodes = vue.ref([
    { id: 'trigger', label: 'trigger', data: {}, position: { x: 0, y: 0 } },
  ]);
  const edges = vue.ref([]);
  const events = [];
  const editor = {
    getNodes: nodes,
    getEdges: edges,
    toObject: () =>
      JSON.parse(JSON.stringify({ nodes: nodes.value, edges: edges.value })),
    setNodes: (value) => {
      nodes.value = value;
    },
    setEdges: (value) => {
      edges.value = value;
    },
    updateNodeData: (id, data) => {
      nodes.value.find((n) => n.id === id).data = data;
    },
  };
  const filename = path.join(
    root,
    'src/components/newtab/workflow/WorkflowSteps.vue'
  );
  const { descriptor } = parse(fs.readFileSync(filename, 'utf8'));
  const compiled = compileScript(descriptor, { id: 'steps-test' });
  const { code } = babel.transformSync(compiled.content, {
    filename: 'steps.js',
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
  const model = await sequence;
  let id = 0;
  const stubs = {
    vue,
    'vue-i18n': { useI18n: () => ({ t: (key) => key, te: () => false }) },
    nanoid: { nanoid: () => `step${++id}` },
    'lodash.clonedeep': (value) => JSON.parse(JSON.stringify(value)),
    '@/utils/getSharedData': {
      getBlocks: () => ({
        trigger: { component: 'BlockBasic', outputs: 1, data: {} },
        delay: {
          name: 'Espera',
          component: 'BlockDelay',
          editComponent: 'EditDelay',
          outputs: 1,
          data: { time: 1000 },
        },
      }),
    },
    '@/utils/stepSequence': model,
  };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    window: { confirm: () => true },
    require: (name) => {
      if (!(name in stubs)) throw new Error(name);
      return stubs[name];
    },
  });
  const component = module.exports.default.setup(
    { editor, disabled, packageMode: false },
    { expose: () => {}, emit: (...args) => events.push(args) }
  );
  return { component, editor, events };
}

test('adicionar, editar tempo, reordenar e excluir atualizam os dados que serão salvos', async () => {
  const { component: view, editor, events } = await setup();
  view.add('delay');
  view.add('delay');
  assert.deepEqual(
    editor.toObject().edges.map((e) => [e.source, e.target]),
    [
      ['trigger', 'step1'],
      ['step1', 'step2'],
    ]
  );
  view.setDelay(editor.getNodes.value[1], '2500');
  assert.equal(editor.toObject().nodes[1].data.time, 2500);
  view.move(2, -1);
  assert.deepEqual(
    editor.toObject().edges.map((e) => [e.source, e.target]),
    [
      ['trigger', 'step2'],
      ['step2', 'step1'],
    ]
  );
  view.remove(editor.getNodes.value.find((n) => n.id === 'step2'));
  const saved = editor.toObject();
  assert.equal(saved.edges[0].target, 'step1');
  assert.equal(saved.nodes[1].data.time, 2500);
  assert.ok(events.some(([name]) => name === 'edit'));
  assert.ok(events.some(([name]) => name === 'change'));
});

test('modo somente leitura e tempos inválidos não modificam o fluxo', async () => {
  const readonly = await setup(true);
  readonly.component.add('delay');
  assert.equal(readonly.editor.toObject().nodes.length, 1);
  const editable = await setup();
  editable.component.add('delay');
  editable.component.setDelay(editable.editor.getNodes.value[1], '-1');
  assert.equal(editable.editor.toObject().nodes[1].data.time, 1000);
  assert.match(editable.component.error.value, /válido/);
});
