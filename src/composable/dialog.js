import emitter from '@/lib/mitt';
import {
  accountFeaturesEnabled,
  accountFeatureMessage,
} from '@/utils/accountPolicy';

export function useDialog() {
  const emitDialog = (type, options = {}) => {
    emitter.emit('show-dialog', { type, options });
  };

  function confirm(options = {}) {
    emitDialog('confirm', options);
  }
  function prompt(options = {}) {
    emitDialog('prompt', options);
  }
  function custom(type, options = {}) {
    if (type === 'auth' && !accountFeaturesEnabled) {
      emitDialog('confirm', {
        title: 'Web Flow sem conta',
        body: accountFeatureMessage,
      });
      return;
    }
    emitDialog(type, { ...options, custom: true });
  }

  return {
    custom,
    prompt,
    confirm,
  };
}
