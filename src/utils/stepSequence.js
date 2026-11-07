export function orderedSteps(graph) {
  const nodes = graph.nodes || [];
  const edges = graph.edges || [];
  const result = [];
  const seen = new Set();
  function visit(node) {
    if (!node || seen.has(node.id)) return;
    seen.add(node.id);
    result.push(node);
    edges
      .filter((edge) => edge.source === node.id)
      .forEach((edge) => visit(nodes.find((item) => item.id === edge.target)));
  }
  visit(nodes.find((node) => node.label === 'trigger') || nodes[0]);
  nodes.forEach(visit);
  return result;
}

export function sequenceEdge(source, target) {
  return {
    id: `step-${source}-${target}`,
    source,
    target,
    sourceHandle: `${source}-output-1`,
    targetHandle: `${target}-input-1`,
    type: 'custom',
    updatable: true,
    class: `source-${source}-output-1 target-${target}-input-1`,
  };
}

export function isLinearSequence(graph) {
  const nodes = orderedSteps(graph);
  const edges = graph.edges || [];
  if (!nodes.length) return true;
  if (
    nodes.some((node) =>
      [
        'conditions',
        'while-loop',
        'repeat-task',
        'element-exists',
        'blocks-group',
        'blocks-group-2',
        'block-package',
      ].includes(node.label)
    )
  )
    return false;
  if (edges.length !== nodes.length - 1) return false;
  return nodes.every((node, index) => {
    const outgoing = edges.filter((edge) => edge.source === node.id);
    const incoming = edges.filter((edge) => edge.target === node.id);
    if (incoming.length !== (index ? 1 : 0)) return false;
    if (outgoing.length !== (index === nodes.length - 1 ? 0 : 1)) return false;
    if (!outgoing.length) return true;
    const edge = outgoing[0];
    return (
      edge.target === nodes[index + 1].id &&
      edge.sourceHandle === `${node.id}-output-1` &&
      edge.targetHandle === `${edge.target}-input-1`
    );
  });
}

export function reorderSteps(graph, ids) {
  if (!isLinearSequence(graph))
    throw new Error(
      'Este fluxo tem caminhos, laços ou passos desconectados. Altere os destinos de cada passo sem reordenar automaticamente.'
    );
  const original = orderedSteps(graph);
  if (
    ids.length !== original.length ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !original.some((node) => node.id === id))
  )
    throw new Error('Ordem de passos inválida.');
  const trigger = original.find((node) => node.label === 'trigger');
  if (trigger && ids[0] !== trigger.id)
    throw new Error('O gatilho deve permanecer no início.');
  const nodes = ids.map((id, index) => ({
    ...original.find((node) => node.id === id),
    position: { x: 200, y: index * 180 },
  }));
  const edges = nodes.slice(1).map((node, index) => {
    const source = nodes[index].id;
    return (
      (graph.edges || []).find(
        (edge) => edge.source === source && edge.target === node.id
      ) || sequenceEdge(source, node.id)
    );
  });
  return { ...graph, nodes, edges };
}

export function appendStep(graph, node, options = {}) {
  if ((graph.nodes || []).some((item) => item.id === node.id))
    throw new Error('ID de passo duplicado.');
  if (
    node.label === 'trigger' &&
    (graph.nodes || []).some((item) => item.label === 'trigger')
  )
    throw new Error('O fluxo já tem um gatilho.');
  const order = orderedSteps(graph);
  const last = order[order.length - 1];
  const connect =
    last &&
    options.connect !== false &&
    isLinearSequence(graph) &&
    ![
      'note',
      'conditions',
      'while-loop',
      'element-exists',
      'blocks-group',
      'blocks-group-2',
      'block-package',
    ].includes(last.label) &&
    !['note', 'trigger'].includes(node.label);
  return {
    ...graph,
    nodes: [...(graph.nodes || []), node],
    edges: [
      ...(graph.edges || []),
      ...(connect ? [sequenceEdge(last.id, node.id)] : []),
    ],
  };
}

export function removeStep(graph, id) {
  const node = (graph.nodes || []).find((item) => item.id === id);
  if (!node) return graph;
  if (node.label === 'trigger')
    throw new Error('O gatilho não pode ser excluído da lista.');
  const linear = isLinearSequence(graph);
  const before = (graph.edges || []).find((edge) => edge.target === id);
  const after = (graph.edges || []).find((edge) => edge.source === id);
  const edges = (graph.edges || []).filter(
    (edge) => edge.source !== id && edge.target !== id
  );
  if (linear && before && after)
    edges.push(sequenceEdge(before.source, after.target));
  return {
    ...graph,
    nodes: graph.nodes.filter((item) => item.id !== id),
    edges,
  };
}
