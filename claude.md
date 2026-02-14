# Specra CLI (create-specra) - Claude Developer Guide

## Introduction
Hi Claude! This guide will help you understand and work with create-specra, the CLI tool for scaffolding Specra documentation projects. This is a project generator similar to sv create, but specifically for Specra documentation sites.

## Project Context

### What is create-specra?
create-specra is a command-line interface tool that:
- Creates new Specra documentation projects from templates
- Handles interactive project setup
- Manages dependency installation
- Provides a zero-config starting point for users

### Why Does It Exist?
Instead of users manually:
1. Creating a SvelteKit project
2. Installing specra and dependencies
3. Configuring files
4. Setting up the directory structure

They can run:
```bash
npx create-specra my-docs
```

And get a fully working documentation site.

### Project Relationships

| Project | Role | Relationship to CLI |
|---------|------|-------------------|
| **specra-sdk** | Core library | CLI installs this as dependency in generated projects |
| **create-specra** | Project generator | This project - creates new sites |
| **specra-docs** | Documentation + SaaS | Shows users how to use both CLI and SDK; also offers paid tiers with Auth.js, Stripe, M-Pesa, and Prisma v7 |

**User Journey**:
1. Developer discovers Specra via specra-docs
2. Runs `npx create-specra my-docs` to scaffold project
3. Gets project with specra SDK pre-configured
4. Refers back to specra-docs for features and customization

## Technical Architecture

### Technology Stack
```
CLI Framework:
├── Commander.js         # Argument parsing, command structure
├── Prompts             # Interactive CLI prompts
├── picocolors          # Terminal coloring
└── validate-npm-package-name  # Project name validation

Build:
├── TypeScript          # Language
└── tsup               # Bundler

Runtime:
└── Node.js            # Execution environment
```

### Project Structure
```
specra-cli/
├── src/
│   ├── index.ts              # Entry point, CLI definition
│   │   ├── Command setup
│   │   ├── Argument/option parsing
│   │   ├── Interactive prompts
│   │   └── Orchestration
│   │
│   ├── create-project.ts     # Project creation logic
│   │   ├── Directory creation
│   │   ├── Template copying
│   │   ├── File processing
│   │   ├── Package.json updates
│   │   └── Dependency installation
│   │
│   └── utils.ts             # Utility functions
│       ├── Project name validation
│       ├── Package manager detection
│       └── File system helpers
│
├── templates/               # Project templates
│   ├── minimal/            # Minimal template (default)
│   │   ├── app/           # SvelteKit app directory
│   │   ├── docs/          # Sample docs
│   │   ├── public/        # Static assets
│   │   ├── specra.config.ts
│   │   ├── svelte.config.js
│   │   ├── tailwind.config.ts
│   │   ├── package.json   # Template dependencies
│   │   └── README.md
│   │
│   ├── default/           # Full-featured (coming soon)
│   └── api-focused/       # API docs focused (coming soon)
│
├── dist/                  # Build output (generated)
│   └── index.js          # Compiled CLI entry
│
├── package.json          # CLI package config
├── tsconfig.json         # TypeScript config
└── tsup.config.ts       # Build config
```

### How It Works

#### 1. User Invocation
```bash
npx create-specra my-docs --template minimal --use-pnpm
```

**What happens**:
- npm downloads latest create-specra from npm registry
- Executes the CLI with provided arguments
- Exits when complete (no persistent installation)

#### 2. Argument Parsing (index.ts)
```typescript
program
  .name('create-specra')
  .argument('[project-directory]', 'Directory name')
  .option('--template <template>', 'Template to use')
  .option('--use-npm', 'Use npm')
  .option('--use-pnpm', 'Use pnpm')
  .option('--use-yarn', 'Use yarn')
  .option('--skip-install', 'Skip installation')
  .action(async (projectDirectory, options) => {
    // Implementation
  })
```

#### 3. Interactive Prompts
If arguments missing, prompt user:
```typescript
// Prompt for project name if not provided
if (!projectName) {
  const response = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'What is your project named?',
    initial: 'my-docs',
    validate: validateProjectName
  })
  projectName = response.projectName
}

// Prompt for template if not provided
if (!template) {
  const response = await prompts({
    type: 'select',
    name: 'template',
    message: 'Which template would you like to use?',
    choices: [
      { title: 'Minimal', value: 'minimal', description: '...' },
      // More templates...
    ]
  })
  template = response.template
}
```

#### 4. Validation (utils.ts)
```typescript
import validateNpmName from 'validate-npm-package-name'

export function validateProjectName(name: string) {
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

Ensures project names follow npm rules:
- No uppercase letters
- No spaces
- No special characters (except hyphens/underscores)
- Not a reserved name

#### 5. Project Creation (create-project.ts)
```typescript
export async function createProject(
  projectName: string,
  template: string,
  options: CreateOptions
) {
  // 1. Resolve paths
  const projectPath = path.resolve(process.cwd(), projectName)
  const templatePath = path.join(__dirname, '../templates', template)

  // 2. Check if directory exists
  if (fs.existsSync(projectPath)) {
    // Handle existing directory
  }

  // 3. Copy template files
  fs.cpSync(templatePath, projectPath, { recursive: true })

  // 4. Update package.json with project name
  const packageJsonPath = path.join(projectPath, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  packageJson.name = projectName
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

  // 5. Install dependencies (unless --skip-install)
  if (!options.skipInstall) {
    const packageManager = detectPackageManager(options)
    await installDependencies(projectPath, packageManager)
  }

  // 6. Display success message
  console.log(successMessage)
}
```

#### 6. Package Manager Detection
```typescript
function detectPackageManager(options: CreateOptions): 'npm' | 'yarn' | 'pnpm' {
  // Check CLI flags first
  if (options.useNpm) return 'npm'
  if (options.useYarn) return 'yarn'
  if (options.usePnpm) return 'pnpm'

  // Check user agent (set by npm/yarn/pnpm when running)
  const userAgent = process.env.npm_config_user_agent
  if (userAgent?.includes('yarn')) return 'yarn'
  if (userAgent?.includes('pnpm')) return 'pnpm'

  // Default to npm
  return 'npm'
}
```

#### 7. Dependency Installation
```typescript
function installDependencies(projectPath: string, pm: string) {
  const command = pm === 'yarn' ? 'yarn install' :
                  pm === 'pnpm' ? 'pnpm install' :
                  'npm install'

  execSync(command, {
    cwd: projectPath,
    stdio: 'inherit'
  })
}
```

### Build System

#### Configuration (tsup.config.ts)
```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  shims: true,
  banner: {
    js: '#!/usr/bin/env node'  // Makes output executable
  }
})
```

#### Build Process
1. Compile TypeScript → JavaScript (ESM)
2. Add shebang (`#!/usr/bin/env node`) to output
3. Output to `dist/index.js`
4. Mark output as executable

#### Package.json Binary
```json
{
  "bin": {
    "create-specra": "./dist/index.js"
  }
}
```

This maps the command `create-specra` to the compiled script, allowing:
```bash
npx create-specra      # Works globally
npm install -g create-specra
create-specra          # Also works
```

## Template System

### Template Structure
Each template in `templates/` is a complete, standalone SvelteKit project:

```
templates/minimal/
├── app/
│   ├── layout.tsx           # Re-exports specra/app/layout
│   ├── page.tsx             # Custom landing page
│   └── [...slug]/
│       └── page.tsx         # Re-exports specra/app/docs-page
│
├── docs/
│   └── v1.0.0/
│       └── index.mdx        # Sample documentation
│
├── public/
│   └── logo.svg             # Logo placeholder
│
├── specra.config.ts         # Specra configuration
├── svelte.config.js           # SvelteKit config (imports specra)
├── tailwind.config.ts       # Tailwind config
├── tsconfig.json            # TypeScript config
├── package.json             # Dependencies (includes specra)
├── .gitignore               # Git ignore rules
└── README.md                # Project readme
```

### Key Template Files

#### app/layout.tsx
```typescript
// Simply re-exports from specra SDK
export { default } from 'specra/app/layout'
export { generateMetadata } from 'specra/app/layout'
```

#### app/[...slug]/page.tsx
```typescript
// Simply re-exports from specra SDK
export { default } from 'specra/app/docs-page'
export { generateStaticParams, generateMetadata } from 'specra/app/docs-page'
```

#### specra.config.ts
```typescript
import { SpecraConfig } from 'specra/lib'

const config: SpecraConfig = {
  site: {
    title: 'My Documentation',
    description: 'Documentation built with Specra',
    url: 'https://example.com'
  },
  theme: {
    defaultMode: 'system',
    primaryColor: '#0070f3'
  },
  navigation: {
    sidebar: true,
    breadcrumbs: true
  }
}

export default config
```

#### package.json
```json
{
  "name": "my-docs",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "vite preview"
  },
  "dependencies": {
    "specra": "^0.1.7",
    "svelte": "^5.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### Adding New Templates

To add a new template:

1. **Create Template Directory**:
```bash
mkdir templates/my-template
```

2. **Build Complete Project**:
Create a full SvelteKit + Specra project in the directory.

3. **Use Placeholders**:
In package.json, use a placeholder for the name:
```json
{
  "name": "specra-template-my-template",
  "version": "0.1.0"
}
```
The CLI will replace the name during project creation.

4. **Add to CLI Options**:
```typescript
// src/index.ts
choices: [
  { title: 'Minimal', value: 'minimal', description: '...' },
  { title: 'My Template', value: 'my-template', description: '...' }
]
```

5. **Test**:
```bash
npm run build
node dist/index.js test-project --template my-template
```

6. **Document**:
Update README.md and specra-docs.

## Development Guide

### Setting Up Development Environment

```bash
# Clone repository
git clone https://github.com/dalmasonto/specra-cli.git
cd specra-cli

# Install dependencies
npm install

# Build
npm run build

# Link globally for testing
npm link

# Now you can use it anywhere
create-specra test-project
```

### Development Workflow

#### Making Changes
1. Edit source files in `src/`
2. Run `npm run dev` for watch mode
3. Test with `npm link` + `create-specra`
4. Unlink with `npm unlink -g create-specra` when done

#### Testing Changes
```bash
# Build
npm run build

# Test locally
node dist/index.js test-project

# Or with link
npm link
create-specra test-project --template minimal

# Clean up
rm -rf test-project
```

### Common Development Tasks

#### Adding a New CLI Option
```typescript
// src/index.ts
program
  .option('--my-option <value>', 'Description of option')
  .action(async (projectDirectory, options) => {
    // Access via options.myOption
    console.log(options.myOption)
  })
```

#### Adding Validation
```typescript
// src/utils.ts
export function validateSomething(value: string) {
  if (/* invalid */) {
    return { valid: false, message: 'Error message' }
  }
  return { valid: true }
}

// src/index.ts
validate: (value) => {
  const result = validateSomething(value)
  return result.valid ? true : result.message
}
```

#### Modifying Template Processing
```typescript
// src/create-project.ts
function processTemplate(templatePath: string, projectPath: string, options: any) {
  // Copy template
  fs.cpSync(templatePath, projectPath, { recursive: true })

  // Post-process files
  const files = fs.readdirSync(projectPath)
  files.forEach(file => {
    // Modify files as needed
  })
}
```

#### Adding New Prompts
```typescript
// src/index.ts
const response = await prompts({
  type: 'confirm',  // or 'text', 'select', 'multiselect'
  name: 'myPrompt',
  message: 'Question to ask?',
  initial: true,
  // validate, format, etc.
})
```

## Error Handling

### Common Errors and Solutions

#### Invalid Project Name
```typescript
if (!validation.valid) {
  console.error(
    pc.red(`Cannot create a project named "${projectName}":\n`)
  )
  validation.problems.forEach(p =>
    console.error(`  ${pc.red('•')} ${p}`)
  )
  process.exit(1)
}
```

#### Directory Already Exists
```typescript
if (fs.existsSync(projectPath)) {
  const response = await prompts({
    type: 'confirm',
    name: 'overwrite',
    message: 'Directory exists. Overwrite?',
    initial: false
  })

  if (!response.overwrite) {
    console.log('Aborting.')
    process.exit(1)
  }

  fs.rmSync(projectPath, { recursive: true })
}
```

#### Installation Failure
```typescript
try {
  installDependencies(projectPath, packageManager)
} catch (error) {
  console.error(pc.red('Failed to install dependencies.'))
  console.log('You can install manually by running:')
  console.log(pc.cyan(`  cd ${projectName}`))
  console.log(pc.cyan(`  ${packageManager} install`))
}
```

### User Experience Considerations

1. **Clear Messages**: Use picocolors for visual hierarchy
2. **Graceful Exits**: Allow users to cancel at any point
3. **Helpful Errors**: Explain what went wrong and how to fix
4. **Progress Indicators**: Show what's happening
5. **Success Instructions**: Tell users what to do next

## Integration Points

### With specra-sdk
The CLI must:
- Use compatible version of specra in templates
- Match SDK's configuration schema
- Re-export SDK components correctly
- Stay updated with SDK changes

### With specra-docs
The documentation should:
- Show CLI usage examples
- Document all CLI options
- Provide template comparisons
- Include troubleshooting

**Note**: specra-docs now includes a SaaS billing layer (Auth.js v5, Stripe, M-Pesa, Prisma v7 + PostgreSQL) with 4 pricing tiers. The CLI generates free, self-hosted documentation sites that do NOT include any billing features.

## Testing Strategies

### Manual Testing
```bash
# Test all options
create-specra test1
create-specra test2 --template minimal
create-specra test3 --use-pnpm
create-specra test4 --skip-install

# Test prompts (don't provide args)
create-specra

# Test validation
create-specra Invalid@Name
create-specra "name with spaces"

# Test existing directory
mkdir existing
create-specra existing
```

### Integration Testing
After generating project:
```bash
cd test-project
npm install  # if skipped
npm run dev  # Should work immediately
# Visit http://localhost:3000
```

## Release Process

### Version Bumping
```bash
# Update version
npm version patch  # or minor, major
```

### Pre-Release Checklist
- [ ] Templates tested with latest specra SDK
- [ ] All options working correctly
- [ ] Dependencies up to date
- [ ] README updated
- [ ] Build successful: `npm run build`

### Publishing
```bash
# Build
npm run build

# Test locally
npm link
create-specra test-final

# Publish
npm publish

# Push
git push && git push --tags
```

### Post-Release
1. Update specra-docs with new version
2. Test `npx create-specra` works with published version
3. Monitor for user issues

## Best Practices

### For Maintainers
1. **Keep Templates Updated**: Match latest specra SDK version
2. **Test All Paths**: Every option and prompt combination
3. **Clear Documentation**: README and --help should be comprehensive
4. **Version Compatibility**: Ensure SDK version compatibility
5. **User Feedback**: Listen to issues and improve UX

### For Contributors
1. **Test Locally**: Use npm link to test changes
2. **Consider UX**: CLI should be intuitive
3. **Error Messages**: Make them helpful, not cryptic
4. **Follow Patterns**: Match existing code style
5. **Update Docs**: Document new features/options

## Troubleshooting

### CLI Doesn't Run
- Check Node.js version (needs 18+)
- Verify npm/npx is installed
- Try `npx create-specra@latest`

### Generated Project Broken
- Check template files are complete
- Verify specra version in template package.json
- Test template manually before publishing

### Installation Fails
- Check network connection
- Verify package manager works independently
- Try different package manager

## Resources

### Official
- **Repository**: https://github.com/dalmasonto/specra-cli
- **npm**: https://www.npmjs.com/package/create-specra

### Related
- **specra SDK**: https://github.com/dalmasonto/specra
- **specra-docs**: https://specra.vercel.app

### Tools Documentation
- **Commander.js**: https://github.com/tj/commander.js
- **Prompts**: https://github.com/terkelg/prompts
- **tsup**: https://tsup.egoist.dev

## Contact

**Authors**: dalmasonto, arthur-kamau
**License**: MIT

---

This guide should give you everything you need to understand, modify, and extend the create-specra CLI tool. The focus is on providing an excellent first-time user experience for Specra.
