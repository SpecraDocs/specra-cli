import { w as writable } from "./exports.js";
import { p as setContext, o as getContext } from "./root.js";
const CONFIG_KEY = Symbol("specra-config");
function setConfigContext(config) {
  const store = writable(config);
  setContext(CONFIG_KEY, store);
  return store;
}
function getConfigContext() {
  const store = getContext(CONFIG_KEY);
  if (!store) {
    throw new Error("getConfigContext must be used within a component with setConfigContext");
  }
  return store;
}
export {
  getConfigContext as g,
  setConfigContext as s
};
