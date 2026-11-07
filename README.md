<img src="src/assets/svg/web-flow.svg" width="88" alt="Logo do Web Flow" />

# Web Flow

Extensão de automação visual para navegadores, com interface em português do Brasil. Conecte blocos para preencher formulários, repetir tarefas, extrair dados, capturar telas e agendar execuções.

Este projeto é uma versão personalizada do [Automa](https://github.com/AutomaApp/automa), mantida em [techcompedro/automacao-web-pro](https://github.com/techcompedro/automacao-web-pro). O Web Flow tem nome e identidade visual próprios e preserva os créditos e as licenças do projeto original.

## Painel em uma aba do navegador

O painel e as configurações abrem em uma aba normal. A extensão reutiliza a aba existente, sem maximizar ou redimensionar o navegador. Painéis antigos abertos como janela separada são movidos para uma janela normal ao reabrir o painel.

## Uso sem login

Esta versão funciona sem conta do Web Flow ou do Automa. O painel e o pop-up abrem diretamente nos fluxos locais. Perfil, equipes, publicação autenticada e backup na nuvem estão desativados. Nenhum usuário ou privilégio remoto é simulado. Importação, exportação e backup local continuam disponíveis; dados locais existentes são preservados. Integrações externas podem ter autorizações próprias.

## Recursos

- Editor visual de fluxos, com condições, laços e variáveis.
- Gravação de ações no navegador e seleção de elementos da página.
- Preenchimento de formulários, coleta de dados e exportação em JSON ou CSV.
- Agendamento, registros de execução e armazenamento local.
- Integrações herdadas com Google Sheets, Google Drive e serviços externos.

O idioma padrão é português do Brasil. As configurações permitem escolher outros idiomas; as traduções desses idiomas foram preservadas. Os nomes técnicos de APIs, os formatos de arquivo e as chaves internas permanecem compatíveis com os fluxos do Automa.

## Preparar o ambiente

Use Node.js 20.11.1 (versão indicada pelo projeto) e pnpm. Clone este repositório e instale as dependências:

```bash
git clone https://github.com/techcompedro/automacao-web-pro.git
cd automacao-web-pro
pnpm install --frozen-lockfile
```

A primeira compilação cria automaticamente `src/utils/getPassKey.js` se o arquivo ainda não existir. A chave é local, não é enviada ao Git e nunca é substituída automaticamente. Preserve esse arquivo entre compilações para continuar lendo os dados protegidos anteriormente.

## Instalação sem erro de manifesto

O ZIP de **Code → Download ZIP** contém o código-fonte, que não pode ser carregado diretamente no Chrome. Execute `pnpm build:install` e carregue a pasta **`build/`**, ou extraia o ZIP gerado em `build-zip/` e selecione a pasta que contém **`manifest.json`**.

Consulte o [guia de instalação](INSTALAR.md) para o passo a passo.

## Desenvolver e compilar

| Comando                             | Resultado                                       |
| ----------------------------------- | ----------------------------------------------- |
| `pnpm dev`                          | Desenvolvimento no Chrome com recarregamento    |
| `pnpm dev:firefox`                  | Desenvolvimento no Firefox                      |
| `pnpm build`                        | Compilação de produção para Chrome em `build/`  |
| `pnpm build:firefox`                | Compilação de produção para Firefox em `build/` |
| `pnpm build:zip`                    | Arquivo ZIP da compilação atual                 |
| `pnpm lint`                         | Verificação do código                           |
| `node utils/check-localization.cjs` | Verificação dos catálogos, nomes e ícones       |

Cada compilação usa a mesma pasta `build/`. Gere o ZIP de um navegador antes de compilar para o outro.

## Instalar localmente

### Chrome e navegadores compatíveis

1. Execute `pnpm build`.
2. Abra `chrome://extensions`.
3. Ative o **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação** e selecione a pasta `build/`.
5. Procure a extensão **Web Flow**, com o ícone em azul e verde.

### Firefox

1. Execute `pnpm build:firefox`.
2. Abra `about:debugging#/runtime/this-firefox`.
3. Clique em **Carregar extensão temporária**.
4. Selecione `build/manifest.json`.

As páginas do Automa nas lojas publicam a extensão original. Esta versão Web Flow deve ser instalada a partir da sua própria compilação até que tenha uma publicação própria.

## Usar a extensão

Abra o ícone do Web Flow e acesse o painel. Crie um fluxo pelo editor ou grave uma sequência de ações. Conecte os blocos ao gatilho inicial, salve e execute. Use os registros do painel para acompanhar os resultados.

As permissões solicitadas dependem dos blocos utilizados. Serviços externos herdados continuam usando seus endereços originais e podem exigir conta, autorização ou configuração adicional. A troca de marca não cria serviços próprios de nuvem, galeria, IA ou Google OAuth.

## Logo e identidade

O símbolo representa um W formado por um fluxo e três nós conectados. O fundo azul-escuro, o azul-claro e o verde distinguem a nova identidade. O arquivo vetorial editável está em `src/assets/svg/web-flow.svg`; as versões usadas no painel, no Firefox e nos ícones PNG são derivadas desse mesmo desenho.

## Documentação e colaboração

- [Documentação técnica do Automa, projeto original](https://docs.extension.automa.site)
- [Relatar problema ou sugerir melhoria no Web Flow](https://github.com/techcompedro/automacao-web-pro/issues)
- [Código e colaboradores do Automa](https://github.com/AutomaApp/automa)

## Licença e créditos

O Web Flow deriva do Automa. Os avisos de licença e os créditos originais foram preservados. Conforme o arquivo original [LICENSE.txt](LICENSE.txt), o código fora de `business/` usa GNU Affero General Public License (AGPL); o conteúdo de `business/` está sujeito à licença comercial do Automa, salvo indicação diferente. Consulte o texto original para os termos aplicáveis.

O arquivo de licença original foi mantido no idioma e na redação de origem para preservar seus termos.
