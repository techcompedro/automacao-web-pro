import browser from 'webextension-polyfill';

/**
 *
 * get all google sheets files in current user's google drive
 * @returns {Promise<Array>} file list [{ id, name, mimeType }]
 */
export default async function fetchGDriveSheets() {
  const { sessionToken, session } = await browser.storage.local.get([
    'sessionToken',
    'session',
  ]);
  if (!sessionToken || !sessionToken.access) return [];

  const isGoogleProvider =
    session?.user?.user_metadata?.iss.includes('google.com');
  if (!isGoogleProvider) return [];

  const accessToken = sessionToken.access;
  const endpoint =
    'https://www.googleapis.com/drive/v3/files?fields=files(id%2Cname%2CmimeType)&q=mimeType%3D%27application%2Fvnd.google-apps.spreadsheet%27&spaces=drive&pageSize=1000';

  try {
    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok)
      throw new Error(
        'Não foi possível carregar a lista de planilhas do Google'
      );
    const data = await res.json();
    return data.files || [];
  } catch (e) {
    // handle token expired or other exceptions
    return [];
  }
}

/**
 * open google picker popup to get user authorized file
 * @param {string} accessToken
 * @returns {Promise<{id, name, mimeType}>}
 */
export function openGDrivePickerPopup() {
  return Promise.reject(
    new Error(
      'O seletor hospedado foi removido. Informe o ID da planilha manualmente no bloco Google Sheets.'
    )
  );
}
