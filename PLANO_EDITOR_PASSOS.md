# Editor de automações por passos

## Objetivo

Abrir o fluxo em uma lista numerada, com ferramentas selecionadas por clique, configuração de cada ação e controle de tempo. Reaproveitar o mecanismo de execução e os arquivos existentes.

## Plano implementado

1. **Lista principal:** mostrar os passos seguindo as conexões, com gatilho no início e identificação dos passos sem conexão de entrada.
2. **Ferramentas:** adicionar ações por uma lista pesquisável pelo seletor nativo; configurar usando os formulários existentes. Oferecer um atalho para adicionar uma espera e editar seu tempo em milissegundos.
3. **Organização:** subir/descer passos em sequências lineares e reconectar os vizinhos ao excluir uma ação intermediária. Preservar IDs e dados dos blocos.
4. **Caminhos:** escolher os próximos passos pelas saídas de cada ação. Mostrar separadamente os destinos existentes, inclusive condições, alternativas e conexões paralelas. Impedir que a reordenação linear apague ramificações ou laços.
5. **Compatibilidade:** conservar o formato de nós/conexões utilizado pelo salvamento, importação, exportação e execução. Manter o mapa avançado como recurso opcional para ferramentas e estruturas especializadas.
6. **Verificação:** testar ordenação, conexões geradas, exclusão, dados preservados, gatilho fixo, ciclos, ramificações, passos desconectados e erros de configuração.

## Limites e critérios

A numeração representa uma sequência de execução somente em fluxos lineares. Em fluxos ramificados, ela identifica os passos; os destinos determinam o caminho. Esses fluxos nunca são convertidos automaticamente em uma lista linear. Os serviços externos anteriormente desativados permanecem desativados.

O plano passa a ser entregue com a versão 1.31.0. A validação automatizada não substitui um teste completo de automação no navegador do usuário.
