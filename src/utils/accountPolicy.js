// This distribution uses local workflows and does not have an account service.
export const accountFeaturesEnabled = false;
export const accountFeatureMessage =
  'Esta versão do Web Flow funciona sem conta. Use a exportação e o backup local em arquivo. Recursos de conta, equipes e nuvem estão desativados.';

export function assertAccountFeaturesEnabled() {
  if (!accountFeaturesEnabled) {
    const error = new Error(accountFeatureMessage);
    error.code = 'ACCOUNT_FEATURES_DISABLED';
    throw error;
  }
}
