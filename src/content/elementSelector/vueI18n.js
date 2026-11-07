import { createI18n } from 'vue-i18n/dist/vue-i18n.esm-bundler';
import enCommon from '@/locales/pt-BR/common.json';
import enBlocks from '@/locales/pt-BR/blocks.json';

const i18n = createI18n({
  locale: 'pt-BR',
  legacy: false,
});

i18n.global.mergeLocaleMessage('pt-BR', enCommon);
i18n.global.mergeLocaleMessage('pt-BR', enBlocks);

export default i18n;
