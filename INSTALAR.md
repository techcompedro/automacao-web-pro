# Instalar o Web Flow no Chrome

## Se você recebeu o ZIP instalável

1. Extraia **todo** o conteúdo de `web-flow-chrome-v1.30.3.zip` para uma pasta permanente.
2. Confirme que essa pasta contém `manifest.json`, `popup.html` e os arquivos `.bundle.js`.
3. Abra `chrome://extensions` e ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta extraída que contém o arquivo `manifest.json`.

Não selecione o arquivo ZIP nem uma pasta acima da que contém o manifesto. Não exclua ou mova a pasta depois de instalar.

## Se você baixou “Code → Download ZIP” do GitHub

Esse ZIP contém o código-fonte. A pasta `automacao-web-pro-main` não é uma extensão pronta para instalar. Gere a extensão primeiro:

```bash
cd ~/Documentos/automacao-web-pro-main
pnpm install --frozen-lockfile
pnpm build:install
```

Você precisa de Node.js e pnpm instalados. O arquivo local `src/utils/getPassKey.js` é criado automaticamente se ainda não existir. Preserve esse arquivo entre compilações para continuar lendo os dados protegidos anteriormente.

Depois, carregue **a pasta `build/`** em `chrome://extensions`. Se preferir distribuir a extensão, o ZIP instalável fica em `build-zip/1.30.3/` e já contém o manifesto na raiz.

Para conferir os arquivos antes de instalar:

```bash
pnpm check:extension
```

## Atualizar uma instalação

Extraia a nova versão na mesma pasta usada na instalação e clique em **Recarregar** no cartão do Web Flow. Para atualizar a partir do código-fonte, compile novamente e recarregue a extensão. Faça uma cópia dos seus fluxos antes de trocar de instalação.

Código-fonte e licenças: https://github.com/techcompedro/automacao-web-pro
