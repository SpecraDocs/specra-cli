import "../../chunks/tabs.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import { i as initConfig, g as getConfig } from "../../chunks/mdx-cache.js";
const $schema = "./node_modules/specra/config/specra.config.schema.json";
const site = { "title": "Modern Docs", "description": "Next-generation documentation platform", "url": "http://localhost:5173", "baseUrl": "/", "language": "en", "organizationName": "my-org", "projectName": "my-project", "activeVersion": "v1.0.0" };
const theme = { "defaultMode": "dark", "respectPrefersColorScheme": true };
const navigation = { "showSidebar": true, "collapsibleSidebar": false, "showBreadcrumbs": true, "showTableOfContents": true, "tocPosition": "right", "tocMaxDepth": 3 };
const products = [{ "id": "platform", "label": "Platform", "default": true }, { "id": "cli", "label": "CLI" }];
const social = { "github": "https://github.com/your-org/your-repo" };
const search = { "enabled": false };
const footer = { "copyright": "Copyright © 2025 Modern Docs. All rights reserved.", "links": [{ "title": "Documentation", "items": [{ "label": "Getting Started", "href": "/docs/platform/v1.0.0/introduction/getting-started" }] }, { "title": "Community", "items": [{ "label": "GitHub", "href": "https://github.com/your-org/your-repo" }] }] };
const banner = { "enabled": false, "message": "This is a development build.", "type": "info", "dismissible": true };
const features = { "showLastUpdated": true, "showReadingTime": true, "showAuthors": false, "showTags": true, "versioning": true, "i18n": false };
const specraConfig = {
  $schema,
  site,
  theme,
  navigation,
  products,
  social,
  search,
  footer,
  banner,
  features
};
initConfig(specraConfig);
const prerender = true;
const trailingSlash = "never";
const load = async () => {
  const config = getConfig();
  return { config };
};
export {
  load,
  prerender,
  trailingSlash
};
