import objectPath from 'object-path';

export async function regexVariable({ id, data }) {
  const refVariables = this.engine.referenceData.variables;
  const variableExist = objectPath.has(refVariables, data.variableName);

  if (!variableExist) {
    throw new Error(
      `Não foi possível encontrar a variável "${data.variableName}"`
    );
  }

  const str = objectPath.get(refVariables, data.variableName);
  if (typeof str !== 'string') {
    throw new Error(
      `O valor da variável "${data.variableName}" não é um texto`
    );
  }

  const method = data.method || 'match';
  const regex = new RegExp(data.expression, data.flag.join(''));

  let newValue = '';

  if (method === 'match') {
    const matches = str.match(regex);
    newValue = matches && !data.flag.includes('g') ? matches[0] : matches;
  } else if (method === 'replace') {
    newValue = str.replace(regex, data.replaceVal ?? '');
  }

  objectPath.set(
    this.engine.referenceData.variables,
    data.variableName,
    newValue
  );

  return {
    data: newValue,
    nextBlockId: this.getBlockConnections(id),
  };
}

export default regexVariable;
