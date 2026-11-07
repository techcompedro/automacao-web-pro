<template>
  <article class="container max-w-3xl space-y-6 py-8">
    <h1 class="text-3xl font-semibold">Ajuda do Web Flow</h1>
    <p>
      Esta ajuda faz parte da extensão e pode ser consultada sem conexão com a
      internet.
    </p>
    <section class="space-y-2">
      <h2 class="text-xl font-semibold">Criar e executar um fluxo</h2>
      <p>
        Abra Meus fluxos, crie um fluxo, adicione um gatilho e conecte os blocos
        na ordem das ações. Salve antes de executar. Para começar com uma
        gravação, abra o site desejado e use Gravar fluxo no menu da extensão.
      </p>
      <router-link to="/workflows" class="underline"
        >Abrir meus fluxos</router-link
      >
    </section>
    <section class="space-y-2">
      <h2 class="text-xl font-semibold">
        Selecionar elementos e coletar dados
      </h2>
      <p>
        Use o seletor de elementos para localizar campos e botões da página.
        Confira o seletor CSS ou XPath no bloco. Salve os valores em variáveis
        ou colunas da tabela do fluxo e use o bloco Exportar dados para gerar um
        arquivo.
      </p>
    </section>
    <section class="space-y-2">
      <h2 class="text-xl font-semibold">
        Configurações, agendamentos e registros
      </h2>
      <p>
        As configurações gerais controlam idioma e editor. Os agendamentos
        precisam do navegador e da extensão em execução. Acompanhe os registros
        para identificar o bloco e a mensagem de uma falha.
      </p>
      <router-link to="/settings" class="mr-4 underline"
        >Configurações</router-link
      >
      <router-link to="/schedule" class="underline">Agendamentos</router-link>
    </section>
    <section class="space-y-2">
      <h2 class="text-xl font-semibold">Backup e restauração</h2>
      <p>
        Exporte seus fluxos ou gere um backup em arquivo antes de reinstalar a
        extensão. Restaure o arquivo pela tela de backup. Seus dados locais não
        são sincronizados com um serviço de nuvem.
      </p>
      <router-link to="/backup" class="underline">Backup local</router-link>
    </section>
    <section class="space-y-2">
      <h2 class="text-xl font-semibold">Recursos externos</h2>
      <p>
        Galeria, comunidades, conta, publicação, seletor hospedado de arquivos e
        serviço AI Power do projeto de origem foram removidos ou desativados. O
        bloco Google Sheets permite informar um ID manualmente; integrações
        externas ainda precisam de autorização própria quando aplicável.
      </p>
      <p>
        As funções JavaScript e os formatos de importação existentes mantêm os
        nomes técnicos para preservar a compatibilidade dos seus fluxos.
      </p>
    </section>
  </article>
</template>
