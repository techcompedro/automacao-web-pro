<template>
  <section
    class="steps-view scroll h-full overflow-auto px-4 pb-16 pt-28 md:px-8"
  >
    <div class="mx-auto max-w-3xl space-y-4">
      <header class="rounded-xl bg-white p-5 dark:bg-gray-800">
        <h2 class="text-2xl font-semibold">Automação passo a passo</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Adicione ações, configure os detalhes e escolha a ordem de execução.
        </p>
        <div v-if="!disabled" class="mt-4 flex flex-wrap items-center gap-2">
          <label class="flex-1"
            >Ferramenta
            <select
              v-model="selected"
              class="mt-1 block w-full rounded-lg border bg-transparent p-2"
            >
              <option v-for="item in available" :key="item.id" :value="item.id">
                {{ title(item.id) }}
              </option>
            </select>
          </label>
          <button
            class="rounded-lg bg-accent px-4 py-2 text-white"
            @click="add(selected)"
          >
            Adicionar passo
          </button>
          <button class="rounded-lg border px-4 py-2" @click="add('delay')">
            + Espera
          </button>
        </div>
        <p v-if="error" role="alert" class="mt-3 text-red-500">{{ error }}</p>
        <p v-if="!linear" class="mt-3 text-sm text-gray-600 dark:text-gray-300">
          Este fluxo possui caminhos, repetições ou passos desconectados.
          Configure os destinos abaixo; a numeração identifica os passos e os
          destinos determinam a execução.
        </p>
      </header>
      <p v-if="!steps.length" class="rounded-xl border p-6">
        Adicione um gatilho para começar sua automação.
      </p>
      <ol class="space-y-4">
        <li
          v-for="(node, index) in steps"
          :key="node.id"
          class="rounded-xl border bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex flex-wrap items-center gap-3">
            <span
              class="rounded-full bg-accent px-3 py-1 font-semibold text-white"
              >Passo {{ index + 1 }}</span
            >
            <h3 class="flex-1 font-semibold">{{ title(node.label) }}</h3>
            <span v-if="node.data.disableBlock" class="text-sm"
              >Desativado</span
            >
            <button
              :disabled="disabled || !blocks[node.label]?.editComponent"
              class="rounded-lg border px-3 py-1 disabled:opacity-40"
              @click="$emit('edit', node)"
            >
              Configurar
            </button>
          </div>
          <p v-if="node.data.description" class="mt-3 text-sm">
            {{ node.data.description }}
          </p>
          <p
            v-if="
              node.label !== 'trigger' &&
              !edges.some((edge) => edge.target === node.id)
            "
            class="mt-2 text-sm text-yellow-600"
          >
            Sem conexão de entrada: escolha este passo como destino de uma ação
            anterior.
          </p>
          <label v-if="node.label === 'delay'" class="mt-3 block text-sm"
            >Tempo de espera (milissegundos)
            <input
              type="number"
              min="0"
              :value="node.data.time"
              :disabled="disabled"
              class="ml-2 w-32 rounded-lg border bg-transparent p-2"
              @change="setDelay(node, $event.target.value)"
            />
          </label>
          <label v-if="node.label === 'repeat-task'" class="mt-3 block text-sm"
            >Quantidade de repetições
            <input
              :value="node.data.repeatFor"
              :disabled="disabled"
              class="ml-2 w-32 rounded-lg border bg-transparent p-2"
              @change="setRepeat(node, $event.target.value)"
            />
          </label>
          <label v-if="node.label === 'note'" class="mt-3 block text-sm"
            >Anotação
            <textarea
              :value="node.data.note"
              :disabled="disabled"
              class="mt-1 w-full rounded-lg border bg-transparent p-2"
              rows="3"
              @input="setNote(node, $event.target.value)"
            />
          </label>
          <div v-if="!disabled" class="mt-3 flex flex-wrap gap-2 text-sm">
            <button
              :disabled="!linear || index <= (hasTrigger ? 1 : 0)"
              class="rounded border px-3 py-1 disabled:opacity-40"
              @click="move(index, -1)"
            >
              ↑ Subir
            </button>
            <button
              :disabled="
                !linear ||
                node.label === 'trigger' ||
                index === steps.length - 1
              "
              class="rounded border px-3 py-1 disabled:opacity-40"
              @click="move(index, 1)"
            >
              ↓ Descer
            </button>
            <button class="rounded border px-3 py-1" @click="toggle(node)">
              {{ node.data.disableBlock ? 'Ativar' : 'Desativar' }}
            </button>
            <button
              v-if="node.label !== 'trigger'"
              class="rounded border px-3 py-1 text-red-500"
              @click="remove(node)"
            >
              Excluir
            </button>
            <button
              class="rounded border px-3 py-1"
              @click="$emit('settings', node)"
            >
              Opções do passo
            </button>
          </div>
          <div
            v-for="port in outputs(node)"
            :key="port.id"
            class="mt-4 border-t pt-3 text-sm dark:border-gray-700"
          >
            <p class="mb-1 font-medium">{{ port.name }}</p>
            <label v-for="edge in port.edges" :key="edge.id" class="mb-2 block"
              >Destino
              <select
                :value="edge.target"
                :disabled="disabled"
                class="ml-2 max-w-full rounded-lg border bg-transparent p-2"
                @change="connect(node, port.id, $event.target.value, edge.id)"
              >
                <option value="">Encerrar este caminho</option>
                <option
                  v-for="target in targets"
                  :key="target.id"
                  :value="target.id"
                >
                  {{ stepLabel(target) }}
                </option>
              </select>
            </label>
            <select
              v-if="!disabled"
              value=""
              class="w-full rounded-lg border bg-transparent p-2"
              :aria-label="`Adicionar destino para ${port.name}`"
              @change="
                connect(node, port.id, $event.target.value);
                $event.target.value = '';
              "
            >
              <option value="">
                {{
                  port.edges.length
                    ? '+ Adicionar outro destino'
                    : 'Fim do caminho — selecione o próximo passo'
                }}
              </option>
              <option
                v-for="target in targets"
                :key="target.id"
                :value="target.id"
              >
                {{ stepLabel(target) }}
              </option>
            </select>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { nanoid } from 'nanoid';
import cloneDeep from 'lodash.clonedeep';
import { getBlocks } from '@/utils/getSharedData';
import {
  orderedSteps,
  isLinearSequence,
  appendStep,
  removeStep,
  reorderSteps,
  sequenceEdge,
} from '@/utils/stepSequence';

const props = defineProps({
  editor: { type: Object, required: true },
  disabled: Boolean,
  packageMode: Boolean,
});
const emit = defineEmits(['edit', 'settings', 'change']);
const { t, te } = useI18n();
const blocks = getBlocks();
const selected = ref('delay');
const error = ref('');
const graph = computed(() => ({
  nodes: props.editor.getNodes.value,
  edges: props.editor.getEdges.value,
}));
const steps = computed(() => orderedSteps(graph.value));
const edges = computed(() => graph.value.edges);
const linear = computed(() => isLinearSequence(graph.value));
const hasTrigger = computed(() =>
  steps.value.some((node) => node.label === 'trigger')
);
const targets = computed(() =>
  steps.value.filter((node) => node.label !== 'trigger')
);
const available = computed(() =>
  Object.entries(blocks)
    .filter(
      ([id]) =>
        id !== 'ai-workflow' &&
        (!props.packageMode ||
          !['trigger', 'execute-workflow', 'block-package'].includes(id)) &&
        (!hasTrigger.value || id !== 'trigger')
    )
    .map(([id, item]) => ({ ...item, id }))
);
function title(id) {
  const key = `workflow.blocks.${id}.name`;
  return te(key) ? t(key) : blocks[id]?.name || id;
}
function stepLabel(node) {
  return `Passo ${
    steps.value.findIndex((item) => item.id === node.id) + 1
  } — ${title(node.label)}`;
}
function apply(action) {
  if (props.disabled) return;
  try {
    const next = action(props.editor.toObject());
    props.editor.setNodes(next.nodes);
    props.editor.setEdges(next.edges);
    error.value = '';
    emit('change');
  } catch (err) {
    error.value = err.message;
  }
}
function add(id) {
  const definition = blocks[id];
  if (!definition) return;
  const node = {
    id: nanoid(),
    label: id,
    type: definition.component,
    data: cloneDeep(definition.data || {}),
    position: { x: 200, y: steps.value.length * 180 },
  };
  apply((data) => {
    const tail = orderedSteps(data).slice(-1)[0];
    return appendStep(data, node, {
      connect: !tail || Number(blocks[tail.label]?.outputs) === 1,
    });
  });
  if (!error.value) emit('edit', node);
}
function move(index, delta) {
  const ids = steps.value.map((node) => node.id);
  [ids[index], ids[index + delta]] = [ids[index + delta], ids[index]];
  apply((data) => reorderSteps(data, ids));
}
function remove(node) {
  if (window.confirm(`Excluir ${stepLabel(node)}?`))
    apply((data) => removeStep(data, node.id));
}
function toggle(node) {
  if (props.disabled) return;
  props.editor.updateNodeData(node.id, {
    ...node.data,
    disableBlock: !node.data.disableBlock,
  });
  emit('change');
}
function setDelay(node, value) {
  if (props.disabled) return;
  const time = Number(value);
  if (!Number.isFinite(time) || time < 0) {
    error.value = 'Informe um tempo de espera válido.';
    return;
  }
  props.editor.updateNodeData(node.id, { ...node.data, time });
  emit('change');
}
function setRepeat(node, repeatFor) {
  if (props.disabled) return;
  props.editor.updateNodeData(node.id, { ...node.data, repeatFor });
  emit('change');
}
function setNote(node, note) {
  if (props.disabled) return;
  props.editor.updateNodeData(node.id, { ...node.data, note });
  emit('change');
}
function outputs(node) {
  if (node.label === 'note') return [];

  const handles =
    node.handleBounds?.source?.map((handle) => handle.id).filter(Boolean) || [];
  const count = Number(blocks[node.label]?.outputs) || 0;
  const known = edges.value
    .filter((edge) => edge.source === node.id)
    .map((edge) => edge.sourceHandle)
    .filter(Boolean);
  const defaults =
    node.label === 'conditions'
      ? (node.data.conditions || [])
          .map((item) => `${node.id}-output-${item.id}`)
          .concat(
            node.data.conditions?.length ? [`${node.id}-output-fallback`] : []
          )
      : Array.from({ length: count }, (_, i) => `${node.id}-output-${i + 1}`);
  return [...new Set([...handles, ...defaults, ...known])].map((id) => {
    const suffix = id.slice(`${node.id}-output-`.length);
    const condition = node.data.conditions?.find(
      (item) => String(item.id) === suffix
    );
    let name = `Caminho ${suffix}`;
    if (suffix === '1') name = 'Próximo passo';
    if (suffix === 'fallback') name = 'Caso contrário';
    if (condition?.name) name = condition.name;
    if (node.label === 'repeat-task' && suffix === '1')
      name = 'Ao terminar as repetições';
    if (node.label === 'repeat-task' && suffix === '2')
      name = 'Repetir a partir deste destino';
    return {
      id,
      name,
      edges: edges.value.filter(
        (edge) => edge.source === node.id && edge.sourceHandle === id
      ),
    };
  });
}
function connect(node, sourceHandle, target, edgeId) {
  apply((data) => {
    const next = data.edges.filter((edge) => edge.id !== edgeId);
    if (
      target &&
      !next.some(
        (edge) => edge.sourceHandle === sourceHandle && edge.target === target
      )
    ) {
      next.push({
        ...sequenceEdge(node.id, target),
        id: nanoid(),
        sourceHandle,
        class: `source-${sourceHandle} target-${target}-input-1`,
      });
    }
    return { ...data, edges: next };
  });
}
</script>
