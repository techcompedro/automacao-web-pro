<template>
  <div class="max-w-xl space-y-4">
    <img src="@/assets/svg/logo.svg" alt="Web Flow" class="w-16" />
    <h2 class="text-2xl font-semibold">Web Flow</h2>
    <p>Versão: {{ version }}</p>
    <p>
      Automatize tarefas do navegador usando blocos visuais, armazenamento local
      e backup em arquivo.
    </p>
    <router-link to="/help" class="inline-block underline"
      >Ajuda local</router-link
    >
    <div class="border-t pt-4 text-sm text-gray-600 dark:text-gray-300">
      <h3 class="mb-2 font-semibold">Licença e atribuição</h3>
      <p>
        Este software deriva do Automa. Os créditos dos autores e os termos
        originais estão preservados no arquivo LICENSE.txt distribuído com a
        extensão. As áreas de código continuam sujeitas às respectivas licenças,
        incluindo AGPL e os avisos específicos da pasta business.
      </p>
    </div>
  </div>
</template>
<script setup>
import browser from 'webextension-polyfill';

const { version } = browser.runtime.getManifest();
</script>
