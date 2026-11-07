import cronstrue from 'cronstrue';
import 'cronstrue/locales/fr';
import 'cronstrue/locales/pt_BR';
import 'cronstrue/locales/zh_TW';
import 'cronstrue/locales/zh_CN';

const supportedLocales = ['en', 'zh', 'zh-TW', 'fr', 'pt-BR'];
const altLocaleId = {
  'pt-BR': 'pt_BR',
  zh: 'zh_CN',
  'zh-TW': 'zh_TW',
};

export function readableCron(expression) {
  const currentLang = document.documentElement.lang;
  const locale = supportedLocales.includes(currentLang)
    ? altLocaleId[currentLang] || currentLang
    : 'pt_BR';

  return cronstrue.toString(expression, { locale });
}

export default cronstrue;
