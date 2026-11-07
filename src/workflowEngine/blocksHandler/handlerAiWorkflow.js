import { postRunAPWorkflow } from '@/utils/getAIPoweredInfo';
import renderString from '../templating/renderString';

async function aiWorkflow(block, { refData }) {
  const {
    flowUuid,
    inputs,
    assignVariable,
    variableName,
    saveData,
    dataColumn,
  } = block.data;

  const replacedValueList = {};
  const aipowerToken = this.engine.workflow.settings?.aipowerToken;

  if (!aipowerToken) {
    throw new Error('O token do AI Power não foi configurado');
  }

  const inputForAPI = {};
  for (const item of inputs) {
    if (typeof item.value === 'object' && item.value !== null) {
      // For file objects, we don't render them as strings.
      // We assume they contain the necessary structure like { filename, url }.
      inputForAPI[item.name] = item.value;
    } else {
      // For strings, we render them using the templating engine.
      const renderedValue = await renderString(
        item.value,
        refData,
        this.engine.isPopup
      );
      inputForAPI[item.name] = renderedValue.value;
      Object.assign(replacedValueList, renderedValue.list);
    }
  }

  try {
    const runResponse = await postRunAPWorkflow(
      { flowUuid, input: inputForAPI },
      aipowerToken
    );
    const { success, msg } = runResponse;

    if (!success) {
      throw new Error(msg || 'Falha na execução do fluxo com IA');
    }

    if (assignVariable) {
      this.setVariable(variableName, runResponse.data.result);
    }

    if (saveData) {
      this.addDataToColumn(dataColumn, runResponse.data.result);
    }

    const nextBlockId = this.getBlockConnections(block.id);

    return {
      data: runResponse.data.result,
      nextBlockId,
      replacedValue: replacedValueList,
    };
  } catch (error) {
    console.error('Falha na execução do fluxo com IA:', error);
    throw new Error(error.message);
  }
}

export default aiWorkflow;
