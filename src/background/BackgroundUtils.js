import browser from 'webextension-polyfill';
import { waitTabLoaded } from '@/workflowEngine/helper';

class BackgroundUtils {
  static async openDashboard(url, updateTab = true) {
    const tabUrl = browser.runtime.getURL(
      `/newtab.html#${typeof url === 'string' ? url : ''}`
    );

    try {
      const tabs = await browser.tabs.query({
        url: `${browser.runtime.getURL('/newtab.html')}*`,
      });
      // Prefer a dashboard already inside a normal browser window.
      const windows = await browser.windows.getAll({ windowTypes: ['normal'] });
      const normalIds = new Set(windows.map((window) => window.id));
      const tab = tabs.find((item) => normalIds.has(item.windowId)) || tabs[0];
      const targetWindow =
        windows.find((window) => window.focused) || windows[0];

      if (tab) {
        let { windowId } = tab;
        if (!normalIds.has(windowId)) {
          // Move a legacy popup tab instead of leaving the user in the old window.
          if (targetWindow) {
            await browser.tabs.move(tab.id, {
              windowId: targetWindow.id,
              index: -1,
            });
            windowId = targetWindow.id;
          } else {
            const created = await browser.windows.create({
              tabId: tab.id,
              type: 'normal',
              focused: updateTab,
            });
            windowId = created.id;
          }
        }
        if (updateTab) {
          await browser.tabs.update(tab.id, { active: true, url: tabUrl });
          await browser.windows.update(windowId, { focused: true });
        }
        return;
      }

      if (targetWindow) {
        await browser.tabs.create({
          url: tabUrl,
          windowId: targetWindow.id,
          active: updateTab,
        });
        if (updateTab)
          await browser.windows.update(targetWindow.id, { focused: true });
      } else {
        // A normal window is only needed when no normal browser window exists.
        await browser.windows.create({
          url: tabUrl,
          type: 'normal',
          focused: updateTab,
        });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async sendMessageToDashboard(type, data) {
    const [tab] = await browser.tabs.query({
      url: browser.runtime.getURL('/newtab.html'),
    });

    await waitTabLoaded({ tabId: tab.id });
    const result = await browser.tabs.sendMessage(tab.id, { type, data });

    return result;
  }
}

export default BackgroundUtils;
