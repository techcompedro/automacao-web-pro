const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const api = import(
  `data:text/javascript;base64,${fs
    .readFileSync(path.join(__dirname, '../src/utils/stepSequence.js'))
    .toString('base64')}`
);
const node = (id, label = 'delay') => ({
  id,
  label,
  type: 'BlockDelay',
  data: { time: 1500, custom: 'preservar' },
  position: { x: 0, y: 0 },
});

test('controle condicional terminal não recebe uma saída padrão inválida ao mover', async () => {
  const { isLinearSequence, reorderSteps } = await api;
  const graph = await chain();
  graph.nodes[2].label = 'conditions';
  graph.nodes[2].data.conditions = [{ id: 'caminho-personalizado' }];
  assert.equal(isLinearSequence(graph), false);
  assert.throws(() => reorderSteps(graph, ['t', 'b', 'a']), /caminhos/);
});
async function chain() {
  const { sequenceEdge } = await api;
  return {
    nodes: [node('t', 'trigger'), node('a'), node('b')],
    edges: [sequenceEdge('t', 'a'), sequenceEdge('a', 'b')],
    zoom: 0.8,
  };
}
test('a ordem segue as conexões, não a posição visual nem a ordem do arquivo', async () => {
  const { orderedSteps } = await api;
  const graph = await chain();
  graph.nodes.reverse();
  assert.deepEqual(
    orderedSteps(graph).map((n) => n.id),
    ['t', 'a', 'b']
  );
});
test('reordenar preserva dados, IDs e o formato executável dos handles', async () => {
  const { reorderSteps } = await api;
  const graph = await chain();
  const before = JSON.stringify(graph);
  const result = reorderSteps(graph, ['t', 'b', 'a']);
  assert.deepEqual(
    result.edges.map((e) => [e.source, e.target]),
    [
      ['t', 'b'],
      ['b', 'a'],
    ]
  );
  assert.equal(result.edges[1].sourceHandle, 'b-output-1');
  assert.equal(result.nodes[1].data.time, 1500);
  assert.equal(result.zoom, 0.8);
  assert.equal(JSON.stringify(graph), before);
  assert.equal(
    JSON.parse(JSON.stringify(result)).nodes[1].data.custom,
    'preservar'
  );
});
test('adicionar espera conecta automaticamente ao fim de uma sequência', async () => {
  const { appendStep } = await api;
  const graph = await chain();
  const result = appendStep(graph, node('wait'));
  assert.equal(result.edges.at(-1).target, 'wait');
  assert.equal(result.edges.at(-1).source, 'b');
});
test('excluir passo linear reconecta anterior e posterior', async () => {
  const { removeStep } = await api;
  const graph = await chain();
  const result = removeStep(graph, 'a');
  assert.deepEqual(
    result.nodes.map((n) => n.id),
    ['t', 'b']
  );
  assert.deepEqual(
    result.edges.map((e) => [e.source, e.target]),
    [['t', 'b']]
  );
  assert.throws(() => removeStep(graph, 't'), /gatilho/);
});
test('fluxos com caminhos e laços não são achatados pela reordenação', async () => {
  const { isLinearSequence, reorderSteps, appendStep, sequenceEdge } =
    await api;
  const graph = await chain();
  graph.edges.push(sequenceEdge('t', 'b'));
  const before = JSON.stringify(graph.edges);
  assert.equal(isLinearSequence(graph), false);
  assert.throws(() => reorderSteps(graph, ['t', 'b', 'a']), /caminhos/);
  assert.equal(JSON.stringify(appendStep(graph, node('c')).edges), before);
  const cycle = await chain();
  cycle.edges.push(sequenceEdge('b', 'a'));
  assert.equal(isLinearSequence(cycle), false);
});
test('ordens inválidas, gatilho deslocado e IDs duplicados são rejeitados', async () => {
  const { reorderSteps, appendStep } = await api;
  const graph = await chain();
  assert.throws(() => reorderSteps(graph, ['t', 'a', 'a']), /inválida/);
  assert.throws(() => reorderSteps(graph, ['a', 't', 'b']), /gatilho/);
  assert.throws(() => appendStep(graph, node('a')), /duplicado/);
  assert.throws(() => appendStep(graph, node('other', 'trigger')), /gatilho/);
});
test('reordenar não elimina fallback de erro nem passos desconectados', async () => {
  const { isLinearSequence, reorderSteps } = await api;
  const graph = await chain();
  graph.edges[1].sourceHandle = 'a-output-fallback';
  assert.equal(isLinearSequence(graph), false);
  assert.throws(() => reorderSteps(graph, ['t', 'b', 'a']));
  const disconnected = await chain();
  disconnected.edges.pop();
  assert.equal(isLinearSequence(disconnected), false);
});
