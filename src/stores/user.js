import { defineStore } from 'pinia';
import browser from 'webextension-polyfill';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    backupIds: [],
    retrieved: false,
    hostedWorkflows: {},
    sharedPackages: [],
  }),
  getters: {
    getHostedWorkflows: (state) => Object.values(state.hostedWorkflows),
    validateTeamAccess:
      (state) =>
      (teamId, access = []) => {
        const currentTeam = state.user?.teams?.find(
          ({ id }) => teamId === id || +teamId === id
        );
        if (!currentTeam) return false;

        return access.some((item) => currentTeam.access.includes(item));
      },
  },
  actions: {
    async loadUser() {
      // Retire only the old product account; preserve workflows and integration tokens.
      await browser.storage.local.remove(['session', 'user']);
      this.user = null;
      this.backupIds = [];
      this.hostedWorkflows = {};
      this.sharedPackages = [];
      this.retrieved = true;
      return null;
    },
    async signOut() {
      try {
        await browser.storage.local.remove(['session', 'user', 'backupIds']);

        localStorage.removeItem('username');

        this.user = null;
        this.backupIds = [];
        this.hostedWorkflows = {};
        this.sharedPackages = [];
        this.retrieved = true;
      } catch (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    },
  },
});
