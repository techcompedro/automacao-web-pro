<template>
  <div class="mx-auto max-w-2xl py-16">
    <img src="@/assets/svg/logo.svg" alt="Web Flow" class="mb-6 w-16" />
    <h1 class="mb-4 text-3xl font-semibold">Bem-vindo ao Web Flow</h1>
    <p class="text-gray-600 dark:text-gray-300">
      Crie automações com blocos visuais, grave ações e organize seus fluxos
      neste navegador, sem conta.
    </p>
    <div class="mt-8 flex flex-wrap gap-4">
      <router-link to="/workflows" class="hoverable rounded-lg border-2 p-4"
        >Meus fluxos</router-link
      >
      <router-link to="/help" class="hoverable rounded-lg border-2 p-4"
        >Ajuda local</router-link
      >
      <router-link to="/backup" class="hoverable rounded-lg border-2 p-4"
        >Backup em arquivo</router-link
      >
    </div>
  </div>
</template>
