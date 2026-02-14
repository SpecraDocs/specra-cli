# Specra CLI (create-specra) - Gemini Developer Guide

## Overview
Welcome! This guide covers create-specra, the scaffolding tool for Specra documentation projects. Think of it as the "create-react-app" for Specra - a zero-config starting point that gets developers up and running in seconds.

## What is create-specra?

### Purpose and Value
create-specra eliminates the friction of starting a new documentation project by:
- **Automating Setup**: No manual configuration needed
- **Providing Templates**: Pre-built starting points
- **Managing Dependencies**: Installs everything automatically
- **Ensuring Best Practices**: Templates follow recommended patterns
- **Saving Time**: From idea to working site in under a minute

### User Experience
```bash
$ npx create-specra my-docs
# 30 seconds later...
$ cd my-docs
$ npm run dev
# Documentation site running at http://localhost:3000
```

That's it. No configuration, no setup, just working documentation.

## Ecosystem Position

### The Three Projects

```
┌─────────────────┐
│  specra-docs    │  ← Documentation website
│  (Website)      │     Shows how to use everything
└────────┬────────┘
         │ refers to
         ▼
┌─────────────────┐     generates    ┌─────────────────┐
│  create-specra  │  ─────────────►  │  User's Project │
│  (CLI Tool)     │     projects     │  (SvelteKit App)  │
└────────┬────────┘     with ───┐    └────────┬────────┘
         │                      │             │
         │ uses templates       │             │ uses as
         │ that include         │             │ dependency
         ▼                      ▼             ▼
┌──────────────────────────────────────────────────────┐
│              specra-sdk (Core Library)               │
│  Provides all components, utilities, and features    │
└──────────────────────────────────────────────────────┘
```

### Relationships

| Project | Package | Type | Role |
|---------|---------|------|------|
| specra-sdk | `specra` | Library | Core documentation framework |
| create-specra | `create-specra` | CLI | Project scaffolding tool |
| specra-docs | N/A | Website | Documentation and examples |

**Flow**:
1. User discovers Specra via docs site
2. Runs `npx create-specra my-docs`
3. Gets project with specra pre-configured
4. Refers to docs for customization

## Technical Details

### Stack Overview

```
CLI Layer:
├── Commander.js        # CLI framework (commands, options, help)
├── Prompts            # Interactive user input
├── picocolors         # Terminal colors and formatting
└── validate-npm-package-name  # Name validation

Development:
├── TypeScript         # Type-safe development
└── tsup              # Fast bundling

Distribution:
├── npm               # Package registry
└── npx               # Direct execution without install
```

### Architecture

#### Core Components

```
create-specra
├── CLI Interface (index.ts)
│   ├── Command definition
│   ├── Argument parsing
│   ├── Option handling
│   └── Interactive prompts
│
├── Project Creator (create-project.ts)
│   ├── Directory management
│   ├── Template copying
│   ├── File transformation
│   ├── Package.json updates
│   └── Dependency installation
│
├── Utilities (utils.ts)
│   ├── Name validation
│   ├── Package manager detection
│   ├── File system operations
│   └── Error handling
│
└── Templates (templates/)
    ├── minimal/          # Lean starting point
    ├── default/          # Full-featured (future)
    └── api-focused/      # API docs (future)
```

#### Directory Layout

```
specra-cli/
├── src/                          # Source TypeScript
│   ├── index.ts                  # 4263 bytes - Main CLI logic
│   ├── create-project.ts         # 3617 bytes - Project creation
│   └── utils.ts                  # 2221 bytes - Helper functions
│
├── templates/                    # Project templates
│   └── minimal/                  # Minimal template
│       ├── app/                  # SvelteKit App Router
│       │   ├── layout.tsx        # Re-exports specra layout
│       │   ├── page.tsx          # Landing page
│       │   └── [...slug]/
│       │       └── page.tsx      # Re-exports specra docs page
│       ├── docs/                 # Documentation content
│       │   └── v1.0.0/
│       │       └── index.mdx
│       ├── public/               # Static assets
│       ├── specra.config.ts      # Specra configuration
│       ├── svelte.config.js        # SvelteKit config
│       ├── tailwind.config.ts    # Tailwind config
│       ├── tsconfig.json         # TypeScript config
│       ├── package.json          # Dependencies
│       ├── .gitignore
│       └── README.md
│
├── dist/                         # Compiled output (generated)
│   └── index.js                  # Executable CLI
│
├── package.json                  # CLI package metadata
├── tsconfig.json                 # TypeScript config
├── tsup.config.ts               # Build configuration
├── README.md                     # User documentation
└── LICENSE.MD                    # MIT license
```

### Execution Flow

#### Phase 1: Invocation
```bash
npx create-specra my-docs --template minimal --use-pnpm
```

**Behind the scenes**:
1. npm checks for local `create-specra` install
2. Not found → downloads latest from npm registry to temp location
3. Executes `dist/index.js` with arguments
4. Cleans up temp files when complete

**Result**: No permanent installation, always latest version.

#### Phase 2: Argument Processing

**Code** (index.ts):
```typescript
const program = new Command()

program
  .name('create-specra')
  .description('Create a new Specra documentation site')
  .argument('[project-directory]', 'Directory to create the project in')
  .option('--template <template>', 'Template to use')
  .option('--use-npm', 'Use npm as the package manager')
  .option('--use-pnpm', 'Use pnpm as the package manager')
  .option('--use-yarn', 'Use yarn as the package manager')
  .option('--skip-install', 'Skip package installation')
  .action(async (projectDirectory, options) => {
    // Main logic
  })

program.parse()
```

**Parsing**:
- `my-docs` → `projectDirectory` argument
- `--template minimal` → `options.template = 'minimal'`
- `--use-pnpm` → `options.usePnpm = true`

#### Phase 3: Interactive Prompts

If user doesn't provide all arguments, prompt for missing info:

```typescript
// Project name prompt
if (!projectName) {
  const response = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'What is your project named?',
    initial: 'my-docs',
    validate: (name) => {
      const validation = validateProjectName(name)
      return validation.valid || validation.problems[0]
    }
  })

  if (!response.projectName) {
    console.log('Aborting.')
    process.exit(1)
  }

  projectName = response.projectName
}

// Template selection prompt
if (!template) {
  const response = await prompts({
    type: 'select',
    name: 'template',
    message: 'Which template would you like to use?',
    choices: [
      {
        title: 'Minimal',
        value: 'minimal',
        description: 'Minimal setup to get started quickly'
      }
    ],
    initial: 0
  })

  template = response.template
}

// Package manager prompt (if needed)
if (!packageManager) {
  const response = await prompts({
    type: 'select',
    name: 'packageManager',
    message: 'Which package manager?',
    choices: [
      { title: 'npm', value: 'npm' },
      { title: 'yarn', value: 'yarn' },
      { title: 'pnpm', value: 'pnpm' }
    ]
  })

  packageManager = response.packageManager
}
```

**User Experience**:
```
$ npx create-specra

? What is your project named? › my-docs
? Which template would you like to use? ›
❯ Minimal - Minimal setup to get started quickly
? Which package manager? › npm
```

#### Phase 4: Validation

**Project Name Validation** (utils.ts):
```typescript
import validateNpmName from 'validate-npm-package-name'

export function validateProjectName(name: string): ValidationResult {
  const validation = validateNpmName(name)

  if (validation.valid) {
    return { valid: true }
  }

  return {
    valid: false,
    problems: [
      ...(validation.errors || []),
      ...(validation.warnings || [])
    ]
  }
}
```

**Rules Enforced**:
- ✅ `my-docs`, `my-documentation`, `docs-site`
- ❌ `My Docs` (spaces), `My-Docs` (uppercase)
- ❌ `@my/docs` (scoped without permission)
- ❌ `node_modules` (reserved name)

**Error Display**:
```
✖ Cannot create a project named "My Docs" because of npm naming restrictions:
  • Name can only contain lowercase letters
  • Spaces are not allowed
```

#### Phase 5: Project Creation

**Main Function** (create-project.ts):
```typescript
export async function createProject(
  projectName: string,
  template: string,
  options: CreateOptions
): Promise<void> {
  const projectPath = path.resolve(process.cwd(), projectName)
  const templatePath = path.join(__dirname, '../templates', template)

  // Step 1: Check if directory exists
  if (fs.existsSync(projectPath)) {
    if (!options.force) {
      console.error(`Directory ${projectName} already exists.`)
      process.exit(1)
    }
    fs.rmSync(projectPath, { recursive: true })
  }

  // Step 2: Create directory
  fs.mkdirSync(projectPath, { recursive: true })

  // Step 3: Copy template files
  console.log(`Creating a new Specra site in ${projectPath}`)
  fs.cpSync(templatePath, projectPath, {
    recursive: true,
    filter: (src) => {
      // Exclude node_modules if present in template
      return !src.includes('node_modules')
    }
  })

  // Step 4: Update package.json
  const packageJsonPath = path.join(projectPath, 'package.json')
  const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf-8')
  )
  packageJson.name = projectName
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n'
  )

  // Step 5: Install dependencies
  if (!options.skipInstall) {
    console.log('Installing dependencies...')
    const pm = options.packageManager || detectPackageManager()

    try {
      await installDependencies(projectPath, pm)
      console.log('Dependencies installed successfully!')
    } catch (error) {
      console.error('Failed to install dependencies.')
      console.log('You can install them manually:')
      console.log(`  cd ${projectName}`)
      console.log(`  ${pm} install`)
    }
  }

  // Step 6: Success message
  displaySuccessMessage(projectName, options.packageManager)
}
```

#### Phase 6: Dependency Installation

**Package Manager Detection**:
```typescript
function detectPackageManager(): 'npm' | 'yarn' | 'pnpm' {
  // Check CLI flags first (handled before this)

  // Check npm_config_user_agent environment variable
  // Set by package managers when running scripts
  const userAgent = process.env.npm_config_user_agent

  if (userAgent) {
    if (userAgent.includes('yarn')) return 'yarn'
    if (userAgent.includes('pnpm')) return 'pnpm'
  }

  // Check for lock files in current directory
  if (fs.existsSync('yarn.lock')) return 'yarn'
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm'
  if (fs.existsSync('package-lock.json')) return 'npm'

  // Default to npm
  return 'npm'
}
```

**Installation**:
```typescript
import { execSync } from 'child_process'

function installDependencies(
  projectPath: string,
  packageManager: string
): void {
  const commands = {
    npm: 'npm install',
    yarn: 'yarn install',
    pnpm: 'pnpm install'
  }

  const command = commands[packageManager]

  execSync(command, {
    cwd: projectPath,
    stdio: 'inherit',  // Show output in real-time
    env: process.env
  })
}
```

**Progress**:
```
Installing dependencies...
npm install

added 234 packages, and audited 235 packages in 12s

found 0 vulnerabilities

Dependencies installed successfully!
```

#### Phase 7: Success Output

```typescript
function displaySuccessMessage(
  projectName: string,
  packageManager: string
) {
  console.log()
  console.log(pc.green('Success!') + ` Created ${projectName}`)
  console.log()
  console.log('Inside that directory, you can run several commands:')
  console.log()
  console.log(pc.cyan(`  ${packageManager} run dev`))
  console.log('    Starts the development server.')
  console.log()
  console.log(pc.cyan(`  ${packageManager} run build`))
  console.log('    Builds the app for production.')
  console.log()
  console.log(pc.cyan(`  ${packageManager} start`))
  console.log('    Runs the built app in production mode.')
  console.log()
  console.log('We suggest that you begin by typing:')
  console.log()
  console.log(pc.cyan(`  cd ${projectName}`))
  console.log(pc.cyan(`  ${packageManager} run dev`))
  console.log()
  console.log('Happy documenting!')
}
```

**Output**:
```
✔ Success! Created my-docs

Inside that directory, you can run several commands:

  npm run dev
    Starts the development server.

  npm run build
    Builds the app for production.

  npm start
    Runs the built app in production mode.

We suggest that you begin by typing:

  cd my-docs
  npm run dev

Happy documenting!
```

### Build System

#### Configuration (tsup.config.ts)
```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],      // Entry point
  format: ['esm'],               // Output format (ES modules)
  target: 'node18',              // Target Node.js 18+
  clean: true,                   // Clean dist/ before build
  shims: true,                   // Add import.meta.url shim
  splitting: false,              // Single output file
  banner: {
    js: '#!/usr/bin/env node\n'  // Shebang for executability
  }
})
```

#### Build Output
```javascript
#!/usr/bin/env node
// dist/index.js

import { Command } from 'commander';
import prompts from 'prompts';
// ... rest of compiled code
```

The shebang (`#!/usr/bin/env node`) tells the OS to execute this file with Node.js.

#### Package Configuration
```json
{
  "name": "create-specra",
  "version": "0.1.7",
  "type": "module",
  "bin": {
    "create-specra": "./dist/index.js"
  },
  "files": [
    "dist",
    "templates"
  ]
}
```

**Key Points**:
- `"type": "module"` - Use ES modules
- `"bin"` - Maps command name to executable
- `"files"` - Only ship dist/ and templates/

#### Installation Flow
When published to npm:
```bash
$ npx create-specra
```

npm:
1. Looks for `create-specra` in local node_modules
2. Not found → downloads from npm registry
3. Checks `package.json` → finds `bin.create-specra`
4. Runs `node ./dist/index.js` with arguments
5. Cleans up after execution

## Template System

### Template Anatomy

The `minimal` template is a complete, runnable SvelteKit project:

```
minimal/
├── app/                      # SvelteKit App Router
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── [...slug]/
│       └── page.tsx          # Docs pages
│
├── docs/                     # MDX documentation
│   └── v1.0.0/
│       ├── index.mdx         # Home page
│       ├── getting-started.mdx
│       └── api/
│           └── reference.mdx
│
├── public/                   # Static assets
│   ├── favicon.ico
│   └── logo.svg
│
├── .gitignore                # Git ignore rules
├── svelte.config.js            # SvelteKit configuration
├── package.json              # Dependencies
├── README.md                 # Project readme
├── specra.config.ts          # Specra configuration
├── tailwind.config.ts        # Tailwind CSS config
└── tsconfig.json             # TypeScript config
```

### Key Template Files

#### 1. app/layout.tsx (Minimal Re-export)
```typescript
// Simply delegates to specra's layout
export { default } from 'specra/app/layout'
export { generateMetadata } from 'specra/app/layout'
```

This is the magic - the entire layout is provided by Specra!

#### 2. app/page.tsx (Custom Landing Page)
```typescript
import { goto } from '$app/navigation'

export default function Home() {
  return (
    <div className="container">
      <h1>Welcome to Your Docs</h1>
      <p>Documentation built with Specra</p>
      <Link href="/docs/v1.0.0">
        Get Started →
      </Link>
    </div>
  )
}
```

Customizable landing page separate from docs.

#### 3. app/[...slug]/page.tsx (Docs Re-export)
```typescript
// Delegates to specra's dynamic docs page
export { default } from 'specra/app/docs-page'
export {
  generateStaticParams,
  generateMetadata
} from 'specra/app/docs-page'
```

Handles all `/docs/**` routes automatically!

#### 4. specra.config.ts (Configuration)
```typescript
import { SpecraConfig } from 'specra/lib'

const config: SpecraConfig = {
  site: {
    title: 'My Documentation',
    description: 'Awesome docs built with Specra',
    url: 'https://example.com',
    logo: '/logo.svg'
  },
  theme: {
    defaultMode: 'system',
    primaryColor: '#0070f3'
  },
  navigation: {
    sidebar: true,
    breadcrumbs: true,
    toc: true
  },
  versions: {
    current: 'v1.0.0',
    available: ['v1.0.0']
  }
}

export default config
```

All Specra behavior configured here.

#### 5. package.json (Dependencies)
```json
{
  "name": "specra-template-minimal",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "vite preview",
    "lint": "npm run check"
  },
  "dependencies": {
    "specra": "^0.1.7",
    "svelte": "^5.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

The CLI updates `"name"` to user's project name.

#### 6. docs/v1.0.0/index.mdx (Sample Content)
```mdx
---
title: Welcome
description: Get started with your documentation
---

# Welcome to Your Documentation

This is your documentation homepage. Edit this file to customize your content.

## Features

- **MDX Support** - Write docs in Markdown with React components
- **Version Control** - Manage multiple documentation versions
- **Search** - Built-in full-text search
- **Themes** - Dark and light modes

## Getting Started

Check out the [Getting Started](/docs/v1.0.0/getting-started) guide.
```

## Development Workflow

### Setting Up

```bash
# Clone repository
git clone https://github.com/dalmasonto/specra-cli.git
cd specra-cli

# Install dependencies
npm install

# Build CLI
npm run build

# Link globally for testing
npm link

# Verify
which create-specra
# Should point to your local version
```

### Development Cycle

```bash
# 1. Make changes to src/

# 2. Rebuild
npm run build

# 3. Test
create-specra test-project

# 4. Verify generated project
cd test-project
npm run dev

# 5. Clean up
cd ..
rm -rf test-project

# 6. Repeat
```

### Watch Mode

```bash
# Terminal 1: Watch and rebuild
npm run dev

# Terminal 2: Test changes
create-specra test-project
```

### Testing Checklist

#### CLI Options
- [ ] `create-specra my-docs` - Basic usage
- [ ] `create-specra` - Prompts for name
- [ ] `create-specra --template minimal` - Template selection
- [ ] `create-specra --use-npm` - Force npm
- [ ] `create-specra --use-yarn` - Force yarn
- [ ] `create-specra --use-pnpm` - Force pnpm
- [ ] `create-specra --skip-install` - Skip installation

#### Validation
- [ ] Valid names accepted: `my-docs`, `docs-site`
- [ ] Invalid names rejected: `My Docs`, `@invalid`
- [ ] Existing directory handled gracefully

#### Generated Project
- [ ] `package.json` has correct name
- [ ] Dependencies installed (unless skipped)
- [ ] `npm run dev` starts server
- [ ] http://localhost:3000 shows landing page
- [ ] http://localhost:3000/docs/v1.0.0 shows docs
- [ ] Styles applied correctly
- [ ] Dark mode toggle works

### Common Tasks

#### Adding CLI Option
```typescript
// src/index.ts
program
  .option('--my-option', 'Description')
  .action(async (projectDir, options) => {
    if (options.myOption) {
      // Handle option
    }
  })
```

#### Adding Template
1. Create `templates/my-template/`
2. Build complete SvelteKit + Specra project
3. Test independently
4. Add to choices in `src/index.ts`
5. Document in README

#### Modifying File Processing
```typescript
// src/create-project.ts
function processTemplateFiles(templatePath, projectPath) {
  fs.cpSync(templatePath, projectPath, { recursive: true })

  // Post-process files
  const configPath = path.join(projectPath, 'specra.config.ts')
  let config = fs.readFileSync(configPath, 'utf-8')
  config = config.replace('PLACEHOLDER', actualValue)
  fs.writeFileSync(configPath, config)
}
```

## Troubleshooting

### Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Command not found | Not linked or not in PATH | Run `npm link` again |
| Template not found | Template directory missing | Check `templates/` exists |
| Permission denied | Binary not executable | Check shebang in dist/index.js |
| Installation fails | Network or npm issue | Use `--skip-install`, install manually |
| Project won't run | Missing dependencies | Run `npm install` in project |
| Styles not working | Tailwind not configured | Check tailwind.config.ts |

### Debugging

```bash
# Run with Node.js directly
node dist/index.js test-project

# Add console.logs in source
console.log('Debug:', variable)

# Check environment
echo $PATH
which node
which npm

# Verify build output
cat dist/index.js | head -n 20
```

## Best Practices

### For Development
1. **Test Every Change**: Run full creation flow
2. **Keep Templates Updated**: Match latest specra version
3. **Handle Errors Gracefully**: Clear messages, no crashes
4. **Document Options**: Help text and README
5. **Version Compatibility**: Ensure SDK compatibility

### For Templates
1. **Minimal Dependencies**: Only include essentials
2. **Working Examples**: Template should run immediately
3. **Clear Structure**: Easy to understand and modify
4. **Best Practices**: Follow SvelteKit and Specra conventions
5. **Documentation**: Include helpful README

### For CLI UX
1. **Clear Prompts**: Obvious questions, helpful defaults
2. **Progress Indicators**: Show what's happening
3. **Colorful Output**: Use picocolors for readability
4. **Error Messages**: Explain problem and solution
5. **Success Instructions**: Tell users what to do next

## Release Process

### Preparation
1. Update specra version in templates
2. Test all templates with new SDK
3. Update README and documentation
4. Bump version: `npm version patch|minor|major`

### Publishing
```bash
# Build
npm run build

# Test locally
npm link
create-specra final-test

# Publish
npm publish

# Push to git
git push && git push --tags
```

### Post-Release
1. Test published version: `npx create-specra@latest test`
2. Update specra-docs with new version info
3. Monitor for issues

## Performance Considerations

### CLI Performance
- **Startup**: ~100ms (fast due to minimal dependencies)
- **Template Copy**: ~50ms for minimal template
- **Dependency Install**: 10-30s depending on package manager

### Optimizations
- Keep dependencies minimal
- Use efficient file operations
- Cache package manager detection
- Stream installation output

## Integration

### With specra-sdk
- Templates must use compatible SDK version
- Configuration schema must match
- Re-exports must be correct
- Update templates when SDK changes

### With specra-docs
- Documentation shows CLI usage
- Examples use CLI-generated structure
- Troubleshooting covers CLI issues

## Resources

### Official
- **Repository**: https://github.com/dalmasonto/specra-cli
- **npm**: https://www.npmjs.com/package/create-specra

### Related
- **specra SDK**: https://github.com/dalmasonto/specra
- **specra-docs**: https://specra.vercel.app

### Dependencies
- **Commander**: https://github.com/tj/commander.js
- **Prompts**: https://github.com/terkelg/prompts
- **tsup**: https://tsup.egoist.dev

## Contact

**Authors**: dalmasonto, arthur-kamau
**License**: MIT

---

This comprehensive guide should help you understand every aspect of create-specra, from architecture to development to release. The CLI is designed to provide the best possible first impression of Specra.
