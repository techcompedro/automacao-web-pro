import objectPath from 'object-path';

export async function increaseVariable({ id, data }) {
  const refVariables = this.engine.referenceData.variables;
  const variableExist = objectPath.has(refVariables, data.variableName);

  if (!variableExist) {
    throw new Error(
      `Não foi possível encontrar a variável "${data.variableName}"`
    );
  }

  const currentVar = +objectPath.get(refVariables, data.variableName);
  if (Number.isNaN(currentVar)) {
    throw new Error(
      `O valor da variável "${data.variableName}" não é um número`
    );
  }

  objectPath.set(
    this.engine.referenceData.variables,
    data.variableName,
    currentVar + data.increaseBy
  );

  return {
    data: refVariables[data.variableName],
    nextBlockId: this.getBlockConnections(id),
  };
}

export default increaseVariable;
