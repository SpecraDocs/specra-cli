import { w as writable, i as get } from "./exports.js";
import { z as noop } from "./root.js";
import "@sveltejs/kit/internal/server";
function getInitialTheme() {
  return "system";
}
function getResolvedTheme(theme) {
  if (theme !== "system")
    return theme;
  return "light";
}
function createThemeStore() {
  const initial = getInitialTheme();
  const { subscribe, set, update } = writable(initial);
  function setTheme(theme) {
    set(theme);
  }
  function toggle() {
    update((current) => {
      const resolved = getResolvedTheme(current);
      const next = resolved === "dark" ? "light" : "dark";
      setTheme(next);
      return next;
    });
  }
  return {
    subscribe,
    set: setTheme,
    toggle,
    getResolved: () => getResolvedTheme(getInitialTheme())
  };
}
const themeStore = createThemeStore();
function createSidebarStore() {
  const { subscribe, set, update } = writable(false);
  return {
    subscribe,
    open: () => set(true),
    close: () => set(false),
    toggle: () => update((v) => !v),
    set
  };
}
const sidebarStore = createSidebarStore();
const is_legacy = noop.toString().includes("$$") || /function \w+\(\) \{\}/.test(noop.toString());
const placeholder_url = "a:";
if (is_legacy) {
  ({
    data: {},
    form: null,
    error: null,
    params: {},
    route: { id: null },
    state: {},
    status: -1,
    url: new URL(placeholder_url)
  });
}
function getInitialTab(defaultTab) {
  return defaultTab;
}
function createTabStore() {
  const { subscribe, set, update } = writable("");
  function initialize(defaultTab) {
    const initial = getInitialTab(defaultTab);
    set(initial);
  }
  function setActiveTab(tabId) {
    set(tabId);
  }
  return {
    subscribe,
    set: setActiveTab,
    initialize,
    get: () => get({ subscribe })
  };
}
createTabStore();
export {
  sidebarStore as s,
  themeStore as t
};
