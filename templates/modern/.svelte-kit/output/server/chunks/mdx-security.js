import path from "path";
function sanitizePath(userPath) {
  const decoded = decodeURIComponent(userPath);
  if (decoded.includes("../") || decoded.includes("..\\") || decoded.includes("%2e%2e") || decoded.includes("%252e%252e") || path.isAbsolute(decoded)) {
    throw new Error("Path traversal detected");
  }
  const normalized = path.normalize(decoded).replace(/\\/g, "/");
  if (normalized.startsWith("..") || normalized.includes("/../")) {
    throw new Error("Invalid path detected");
  }
  return normalized;
}
function validatePathWithinDirectory(filePath, allowedDir) {
  const resolvedPath = path.resolve(allowedDir, filePath);
  const resolvedDir = path.resolve(allowedDir);
  return resolvedPath.startsWith(resolvedDir + path.sep) || resolvedPath === resolvedDir;
}
const DANGEROUS_PATTERNS = [
  // JavaScript execution
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /import\s*\(/gi,
  /require\s*\(/gi,
  // File system access
  /fs\.[a-z]+/gi,
  /readFile/gi,
  /writeFile/gi,
  /process\.env/gi,
  // Network requests during SSR (legitimate client-side usage should use components)
  /fetch\s*\(/gi,
  // Dangerous Node.js modules
  /child_process/gi,
  /exec\s*\(/gi,
  /spawn\s*\(/gi,
  // Script tag injection
  /<script[>\s]/gi,
  /javascript:/gi,
  /\bon(abort|blur|cancel|canplay|canplaythrough|change|click|close|contextmenu|cuechange|dblclick|drag|dragend|dragenter|dragleave|dragover|dragstart|drop|durationchange|emptied|ended|error|focus|input|invalid|keydown|keypress|keyup|load|loadeddata|loadedmetadata|loadstart|mousedown|mouseenter|mouseleave|mousemove|mouseout|mouseover|mouseup|mousewheel|pause|play|playing|progress|ratechange|reset|resize|scroll|seeked|seeking|select|show|stalled|submit|suspend|timeupdate|toggle|volumechange|waiting|wheel)\s*=/gi
  // onclick, onerror, onload, etc.
];
function removeCodeBlocks(content) {
  let withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, "");
  withoutCodeBlocks = withoutCodeBlocks.replace(/`[^`]*`/g, "");
  return withoutCodeBlocks;
}
function scanMDXForDangerousPatterns(content) {
  const issues = [];
  const contentWithoutCode = removeCodeBlocks(content);
  for (const pattern of DANGEROUS_PATTERNS) {
    const matches = contentWithoutCode.match(pattern);
    if (matches) {
      issues.push(`Dangerous pattern detected: ${pattern.source}`);
    }
  }
  return issues;
}
function sanitizeMDXContent(content, strict = false) {
  if (strict) {
    const issues = scanMDXForDangerousPatterns(content);
    if (issues.length > 0) {
      throw new Error(`MDX content contains dangerous patterns: ${issues.join(", ")}`);
    }
  }
  let sanitized = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/javascript:/gi, "");
  return sanitized;
}
const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    // Required for Next.js
    "'unsafe-eval'"
    // Required for dev mode - remove in production
  ],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "img-src": ["'self'", "data:", "https:"],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
  "connect-src": ["'self'"],
  "frame-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'self'"],
  "upgrade-insecure-requests": []
};
function generateCSPHeader(customDirectives, production = true) {
  const directives = { ...CSP_DIRECTIVES, ...customDirectives };
  if (production && directives["script-src"]) {
    directives["script-src"] = directives["script-src"].filter((src) => src !== "'unsafe-eval'");
  }
  return Object.entries(directives).map(([key, values]) => `${key} ${values.join(" ")}`).join("; ");
}
const SAFE_MDX_COMPONENTS = /* @__PURE__ */ new Set([
  // Standard HTML elements (automatically allowed by MDX)
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "a",
  "ul",
  "ol",
  "li",
  "code",
  "pre",
  "blockquote",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "img",
  "video",
  "audio",
  "br",
  "hr",
  "strong",
  "em",
  // Custom safe components
  "Callout",
  "CodeBlock",
  "Accordion",
  "AccordionItem",
  "Tabs",
  "Tab",
  "Image",
  "Video",
  "Card",
  "CardGrid",
  "ImageCard",
  "ImageCardGrid",
  "Steps",
  "Step",
  "Icon",
  "Mermaid",
  "Math",
  "Columns",
  "Column",
  "Badge",
  "Tooltip",
  "Frame",
  "ApiEndpoint",
  "ApiParams",
  "ApiResponse",
  "ApiPlayground",
  "ApiReference"
]);
function validateMDXComponents(content) {
  const issues = [];
  const componentRegex = /<([A-Z][a-zA-Z0-9]*)/g;
  let match;
  while ((match = componentRegex.exec(content)) !== null) {
    const componentName = match[1];
    if (!SAFE_MDX_COMPONENTS.has(componentName)) {
      issues.push(`Unsafe component detected: ${componentName}`);
    }
  }
  return {
    valid: issues.length === 0,
    issues
  };
}
function validateMDXSecurity(content, options = {}) {
  const { strictMode = false, allowCustomComponents = true, blockDangerousPatterns = true } = options;
  const issues = [];
  if (blockDangerousPatterns) {
    const patternIssues = scanMDXForDangerousPatterns(content);
    issues.push(...patternIssues);
  }
  if (!allowCustomComponents) {
    const componentValidation = validateMDXComponents(content);
    if (!componentValidation.valid) {
      issues.push(...componentValidation.issues);
    }
  }
  if (strictMode && issues.length > 0) {
    return { valid: false, issues };
  }
  const sanitized = sanitizeMDXContent(content, false);
  return {
    valid: true,
    issues,
    sanitized
  };
}
export {
  validateMDXSecurity as a,
  generateCSPHeader as g,
  sanitizePath as s,
  validatePathWithinDirectory as v
};
