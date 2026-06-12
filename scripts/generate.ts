import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Helper to convert kebab-case or spaces to CamelCase
function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/[\s-_]+/g, '');
}

// Helper to convert CamelCase or spaces to kebab-case
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// Helper to convert spaces or kebab to snake_case
function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

// Helper to convert kebab-case to Title Case (e.g. todo-list -> Todo List)
function toTitleCase(str: string): string {
  return str
    .replace(/[\s-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`EXBA Code Generator CLI v2.0.0

Usage:
  bun run generate <name> [options]

Arguments:
  <name>          Name of the component/feature to scaffold (kebab-case or title-cased)

Options:
  --type=<type>   Scaffold type: "feature" | "widget" (default: "feature")
  --no-wasm       Disable Rust/WASM backend integration (scaffold TS-only reactive component)
  --icon=<emoji>  Emoji icon for sidebar navigation menu (default: "✨")
  --help, -h      Display this instruction help dictionary

Examples:
  bun run generate chat-panel --icon=💬
  bun run generate date-slider --type=widget --no-wasm
`);
    process.exit(0);
  }

  let rawName = '';
  let type = 'feature'; // 'feature' | 'widget'
  let wasm = true;
  let icon = '✨';

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--type=')) {
      type = arg.split('=')[1].toLowerCase();
    } else if (arg === '--type') {
      type = args[++i].toLowerCase();
    } else if (arg.startsWith('--icon=')) {
      icon = arg.split('=')[1];
    } else if (arg === '--icon') {
      icon = args[++i];
    } else if (arg === '--no-wasm' || arg === '--wasm=false') {
      wasm = false;
    } else if (arg.startsWith('--wasm=')) {
      wasm = arg.split('=')[1] === 'true';
    } else if (arg === '--wasm') {
      wasm = true;
    } else if (!arg.startsWith('-')) {
      rawName = arg;
    }
  }

  if (!rawName) {
    console.error('Error: Please provide a feature name. Run "bun run generate --help" for options.');
    process.exit(1);
  }

  if (type !== 'feature' && type !== 'widget') {
    console.error(`Error: Invalid type "${type}". Supported types are "feature" and "widget".`);
    process.exit(1);
  }

  const kebabName = toKebabCase(rawName);
  const camelName = toCamelCase(rawName);
  const snakeName = toSnakeCase(rawName);
  const titleName = toTitleCase(rawName);

  const projectRoot = process.cwd();
  console.log(`🚀 Scaffolding ${type === 'feature' ? 'Feature' : 'Widget'} "${titleName}" [WASM: ${wasm}]...`);

  // Target paths setup
  const destSubdir = type === 'feature' ? 'features' : 'widgets';
  const targetDir = path.join(projectRoot, 'src', 'components', destSubdir);
  const tsComponentPath = path.join(targetDir, `${kebabName}.ts`);
  const testsDir = path.join(targetDir, 'tests');
  const testPath = path.join(testsDir, `${kebabName}.test.ts`);

  if (fs.existsSync(tsComponentPath)) {
    console.error(`Error: Component already exists at ${tsComponentPath}`);
    process.exit(1);
  }

  // Ensure directories exist
  fs.mkdirSync(testsDir, { recursive: true });

  // 1. Generate TS Component
  let tsBoilerplate = '';
  if (wasm) {
    tsBoilerplate = `import { ExbaComponent } from '@core/lifecycle/component';
import { html } from '@core/dom/dom';
import { EXBA } from '@core/lifecycle/exba';
import { t } from '@shell/theme/styles';

/**
 * Scaffolding for the ${titleName} ${type === 'feature' ? 'Feature' : 'Widget'} Component.
 * Powered by the EXBA Rust WebAssembly state engine.
 * 
 * @extends ExbaComponent
 */
export class ${camelName}Component extends ExbaComponent {
  static useShadow = true;

  static props = {
    status: 'string',
  };

  static styles = {
    container: \`padding: 2rem; width: 100%; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif; color: \${t.zinc100};\`,
    card: \`background: \${t.zinc900a}; border: 1px solid \${t.zinc800a}; border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); backdrop-filter: blur(8px); display: flex; flex-direction: column; gap: 1rem;\`,
    title: \`font-size: 1.5rem; font-weight: 700; color: \${t.indigo400};\`,
    btn: \`padding: 0.5rem 1rem; background: \${t.indigo600}; border: none; border-radius: 0.5rem; color: \${t.white}; font-weight: 600; cursor: pointer; transition: background 0.2s; &:hover { background: \${t.indigo500}; }\`,
    input: \`padding: 0.5rem; background: \${t.zinc850}; border: 1px solid \${t.zinc700}; border-radius: 0.5rem; color: \${t.zinc100}; outline: none;\`,
  };

  protected async onMount() {
    this.setState({ status: 'Loading state from WASM...' });
    await this.fetchFromWasm();
  }

  private async fetchFromWasm() {
    try {
      const response = await EXBA.api.process_ir(JSON.stringify({
        type: '${camelName}Fetch',
        payload: null
      }));
      if (response.type === '${camelName}Data') {
        this.setState({ status: response.payload.status });
      }
    } catch (e) {
      console.error('Failed to communicate with WASM:', e);
    }
  }

  public async sendToWasm(text: string) {
    try {
      const response = await EXBA.api.process_ir(JSON.stringify({
        type: '${camelName}Submit',
        payload: { input: text }
      }));
      if (response.type === '${camelName}Data') {
        this.setState({ status: response.payload.status });
      }
    } catch (e) {
      console.error('Failed to post data to WASM:', e);
    }
  }

  render() {
    const statusText = this.state.status || 'No status received';
    return html\`
      <div class="container">
        <div class="card">
          <h1 class="title">${titleName} ${type === 'feature' ? 'Feature' : 'Widget'}</h1>
          <p style="color: \${t.zinc400}; font-size: 0.9rem;">
            This component communicates with the Rust WASM engine to query and mutate state.
          </p>
          <div style="padding: 1rem; background: \${t.zinc800}; border-radius: 0.5rem; font-family: monospace;">
            WASM Engine Status: <span class="wasm-status" style="color: \${t.emerald400}; font-weight: bold;">\${statusText}</span>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <input id="action-input" class="input" type="text" placeholder="Type new state..." />
            <button class="btn" onclick="
              const input = this.getRootNode().getElementById('action-input');
              if (input && input.value) {
                this.getRootNode().host.sendToWasm(input.value);
                input.value = '';
              }
            ">Mutate WASM State</button>
          </div>
        </div>
      </div>
    \`;
  }
}
`;
  } else {
    tsBoilerplate = `import { ExbaComponent } from '@core/lifecycle/component';
import { html } from '@core/dom/dom';
import { t } from '@shell/theme/styles';

/**
 * Scaffolding for the ${titleName} ${type === 'feature' ? 'Feature' : 'Widget'} Component.
 * Pure TypeScript reactive component without WASM back-channel bindings.
 * 
 * @extends ExbaComponent
 */
export class ${camelName}Component extends ExbaComponent {
  static useShadow = true;

  count = this.useSignal(0);

  static props = {
    title: 'string',
  };

  static styles = {
    container: \`padding: 2rem; width: 100%; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif; color: \${t.zinc100};\`,
    card: \`background: \${t.zinc900a}; border: 1px solid \${t.zinc800a}; border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); backdrop-filter: blur(8px); display: flex; flex-direction: column; gap: 1rem;\`,
    title: \`font-size: 1.5rem; font-weight: 700; color: \${t.indigo400};\`,
    btn: \`padding: 0.5rem 1rem; background: \${t.indigo600}; border: none; border-radius: 0.5rem; color: \${t.white}; font-weight: 600; cursor: pointer; transition: background 0.2s; &:hover { background: \${t.indigo500}; }\`,
  };

  protected onMount() {
    this.shadowRoot?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('btn-inc')) {
        this.count.value++;
      }
    });
  }

  render() {
    return html\`
      <div class="container">
        <div class="card">
          <h1 class="title">${titleName} ${type === 'feature' ? 'Feature' : 'Widget'}</h1>
          <p style="color: \${t.zinc400}; font-size: 0.9rem;">
            This is a pure client-side TypeScript component utilizing EXBA reactive signals.
          </p>
          <div style="padding: 1rem; background: \${t.zinc800}; border-radius: 0.5rem; font-family: monospace;">
            Count: <span class="counter-val" style="color: \${t.emerald400}; font-weight: bold;">\${this.count.value}</span>
          </div>
          <button class="btn btn-inc">Increment</button>
        </div>
      </div>
    \`;
  }
}
`;
  }

  fs.writeFileSync(tsComponentPath, tsBoilerplate);
  console.log(`  ✅ Generated TS Component at: [${path.basename(tsComponentPath)}](file://${tsComponentPath})`);

  // 2. Generate Unit Test
  let testBoilerplate = '';
  if (wasm) {
    testBoilerplate = `import { screen } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ${camelName}Component } from '../${kebabName}';
import { EXBA } from '@core/lifecycle/exba';

if (!customElements.get('exba-${kebabName}')) {
  customElements.define('exba-${kebabName}', ${camelName}Component);
}

describe('${camelName}Component Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('should render the component and communicate with Rust WASM', async () => {
    const processIrSpy = vi.spyOn(EXBA.api, 'process_ir').mockResolvedValue({
      type: '${camelName}Data',
      payload: { status: 'Mocked WASM State' }
    });

    document.body.innerHTML = '<exba-${kebabName} data-testid="comp"></exba-${kebabName}>';
    const el = screen.getByTestId('comp');
    expect(el).toBeDefined();

    await new Promise((resolve) => setTimeout(resolve, 15));

    const shadow = el.shadowRoot!;
    expect(shadow.innerHTML).toContain('${titleName} ${type === 'feature' ? 'Feature' : 'Widget'}');
    expect(shadow.innerHTML).toContain('Mocked WASM State');
    expect(processIrSpy).toHaveBeenCalled();
  });
});
`;
  } else {
    testBoilerplate = `import { screen, fireEvent } from '@testing-library/dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ${camelName}Component } from '../${kebabName}';

if (!customElements.get('exba-${kebabName}')) {
  customElements.define('exba-${kebabName}', ${camelName}Component);
}

describe('${camelName}Component Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should render pure TS component and update counter', async () => {
    document.body.innerHTML = '<exba-${kebabName} data-testid="comp"></exba-${kebabName}>';
    const el = screen.getByTestId('comp') as any;
    expect(el).toBeDefined();

    const shadow = el.shadowRoot!;
    expect(shadow.innerHTML).toContain('${titleName} ${type === 'feature' ? 'Feature' : 'Widget'}');

    const counter = shadow.querySelector('.counter-val');
    expect(counter?.innerHTML).toBe('0');

    const btn = shadow.querySelector('button');
    expect(btn).not.toBeNull();

    fireEvent.click(btn!);
    await new Promise((resolve) => setTimeout(resolve, 15));
    expect(counter?.innerHTML).toBe('1');
  });
});
`;
  }

  fs.writeFileSync(testPath, testBoilerplate);
  console.log(`  ✅ Generated Unit Test at: [${path.basename(testPath)}](file://${testPath})`);

  // 3. Register TS Component in index.ts
  const indexFile = path.join(projectRoot, 'src', 'components', destSubdir, 'index.ts');
  if (fs.existsSync(indexFile)) {
    let indexContent = fs.readFileSync(indexFile, 'utf8');

    // Add import statement (if not already exists)
    if (!indexContent.includes(`from './${kebabName}'`)) {
      const importStatement = `import { ${camelName}Component } from './${kebabName}';\n`;
      const lastImportIndex = indexContent.lastIndexOf("import {");
      const endOfLastImportLine = indexContent.indexOf('\n', lastImportIndex);
      indexContent = indexContent.slice(0, endOfLastImportLine + 1) + importStatement + indexContent.slice(endOfLastImportLine + 1);
    }

    // Add register call (if not already exists)
    if (!indexContent.includes(`exba-${kebabName}`)) {
      const registerCall = `  EXBA.register('exba-${kebabName}', ${camelName}Component);\n`;
      const registerFnName = type === 'feature' ? 'registerFeatures' : 'registerWidgets';
      const registerFeaturesIndex = indexContent.indexOf(`export function ${registerFnName}() {`);
      const registerFeaturesOpenBracket = indexContent.indexOf('{', registerFeaturesIndex);
      indexContent = indexContent.slice(0, registerFeaturesOpenBracket + 1) + '\n' + registerCall + indexContent.slice(registerFeaturesOpenBracket + 2);
    }

    fs.writeFileSync(indexFile, indexContent);
    console.log(`  ✅ Registered TS Component in: [${path.basename(indexFile)}](file://${indexFile})`);
  }

  // 4. Rust WASM integration
  if (wasm) {
    // Generate Rust module: wasm/src/${snakeName}.rs
    const rustModulePath = path.join(projectRoot, 'wasm', 'src', `${snakeName}.rs`);
    if (!fs.existsSync(rustModulePath)) {
      const rustBoilerplate = `use serde::{Serialize, Deserialize};
use ts_rs::TS;
use std::sync::Mutex;
use lazy_static::lazy_static;

#[derive(Serialize, Deserialize, Debug, Clone, TS, PartialEq)]
#[ts(export)]
pub struct ${camelName}State {
    pub status: String,
}

lazy_static! {
    static ref GLOBAL_FEATURE_STATE: Mutex<${camelName}State> = Mutex::new(${camelName}State {
        status: "Initialized inside Rust WASM".to_string(),
    });
}

pub fn get_state() -> ${camelName}State {
    GLOBAL_FEATURE_STATE.lock().unwrap().clone()
}

pub fn set_status(new_status: String) -> ${camelName}State {
    let mut state = GLOBAL_FEATURE_STATE.lock().unwrap();
    state.status = new_status;
    state.clone()
}
`;
      fs.writeFileSync(rustModulePath, rustBoilerplate);
      console.log(`  ✅ Generated Rust Module at: [${path.basename(rustModulePath)}](file://${rustModulePath})`);
    } else {
      console.log(`  ℹ️ Rust Module already exists at: [${path.basename(rustModulePath)}](file://${rustModulePath})`);
    }

    // Register module in wasm/src/lib.rs
    const rustLibPath = path.join(projectRoot, 'wasm', 'src', 'lib.rs');
    if (fs.existsSync(rustLibPath)) {
      let libContent = fs.readFileSync(rustLibPath, 'utf8');

      // Add pub mod declaration (if not already exists)
      if (!libContent.includes(`pub mod ${snakeName};`)) {
        const modDeclaration = `pub mod ${snakeName};\n`;
        const lastPubModIndex = libContent.lastIndexOf('pub mod ');
        const endOfLastPubModLine = libContent.indexOf('\n', lastPubModIndex);
        libContent = libContent.slice(0, endOfLastPubModLine + 1) + modDeclaration + libContent.slice(endOfLastPubModLine + 1);
      }

      // Add routing in process_ir_logic (if not already exists)
      if (!libContent.includes(`IRCommand::${camelName}Fetch`)) {
        const patternMatch = `        IRCommand::${camelName}Fetch => {
            info!("${camelName} state requested");
            IRResult::${camelName}Data(${snakeName}::get_state())
        },
        IRCommand::${camelName}Submit { input } => {
            info!("${camelName} state update requested: {}", input);
            IRResult::${camelName}Data(${snakeName}::set_status(input))
        },\n`;

        const matchCommandIndex = libContent.indexOf('match command {');
        const openBracketIndex = libContent.indexOf('{', matchCommandIndex);
        libContent = libContent.slice(0, openBracketIndex + 1) + '\n' + patternMatch + libContent.slice(openBracketIndex + 2);
      }

      // Add exposed command metadata for reflection API (if not already exists)
      if (!libContent.includes(`"${camelName}Fetch"`)) {
        const exposedCommandInsert = `        serde_json::json!({ "name": "${camelName}Fetch", "description": "Fetch ${titleName} state (WASM)", "payload": "None" }),
        serde_json::json!({ "name": "${camelName}Submit", "description": "Mutate ${titleName} state (WASM)", "payload": "{ input: String }" }),\n`;

        const commandsVecIndex = libContent.indexOf('let commands = vec![');
        if (commandsVecIndex !== -1) {
          libContent = libContent.slice(0, commandsVecIndex + 20) + '\n' + exposedCommandInsert + libContent.slice(commandsVecIndex + 20);
        }
      }

      fs.writeFileSync(rustLibPath, libContent);
      console.log(`  ✅ Routed IRCommands in Rust entrypoint: [${path.basename(rustLibPath)}](file://${rustLibPath})`);
    }

    // Add Commands in wasm/src/ir.rs
    const rustIrPath = path.join(projectRoot, 'wasm', 'src', 'ir.rs');
    if (fs.existsSync(rustIrPath)) {
      let irContent = fs.readFileSync(rustIrPath, 'utf8');

      let updated = false;
      // Add commands to IRCommand enum
      if (!irContent.includes(`${camelName}Fetch`)) {
        const irCommandInsert = `    ${camelName}Fetch,\n    ${camelName}Submit { input: String },\n`;
        const commandEnumIndex = irContent.indexOf('pub enum IRCommand {');
        const commandEnumBracket = irContent.indexOf('{', commandEnumIndex);
        irContent = irContent.slice(0, commandEnumBracket + 1) + '\n' + irCommandInsert + irContent.slice(commandEnumBracket + 2);
        updated = true;
      }

      // Add result to IRResult enum
      if (!irContent.includes(`${camelName}Data`)) {
        const irResultInsert = `    ${camelName}Data(crate::${snakeName}::${camelName}State),\n`;
        const resultEnumIndex = irContent.indexOf('pub enum IRResult {');
        const resultEnumBracket = irContent.indexOf('{', resultEnumIndex);
        irContent = irContent.slice(0, resultEnumBracket + 1) + '\n' + irResultInsert + irContent.slice(resultEnumBracket + 2);
        updated = true;
      }

      if (updated) {
        fs.writeFileSync(rustIrPath, irContent);
        console.log(`  ✅ Defined IRCommand / IRResult mapping: [${path.basename(rustIrPath)}](file://${rustIrPath})`);
      }
    }
  }

  // 5. Add constants entry in src/shell/constants.ts
  const shellConstantsPath = path.join(projectRoot, 'src', 'shell', 'constants.ts');
  if (fs.existsSync(shellConstantsPath)) {
    let constantsContent = fs.readFileSync(shellConstantsPath, 'utf8');

    if (!constantsContent.includes(`id: '${kebabName}'`)) {
      // Look for 'component-examples' category items array
      const componentExamplesIndex = constantsContent.indexOf("id: 'component-examples'");
      const itemsIndex = constantsContent.indexOf('items: [', componentExamplesIndex);
      const openBracket = constantsContent.indexOf('[', itemsIndex);

      const bridgeCodeSnippet = wasm 
        ? `await EXBA.callBridge('process_ir', { type: '${camelName}Fetch' })`
        : `// Pure reactive component`;

      const constantItem = `      {
        id: '${kebabName}',
        label: '${titleName}',
        icon: '${icon}',
        code: \`${bridgeCodeSnippet}\`,
        component: 'exba-${kebabName}',
      },\n`;

      constantsContent = constantsContent.slice(0, openBracket + 1) + '\n' + constantItem + constantsContent.slice(openBracket + 2);
      fs.writeFileSync(shellConstantsPath, constantsContent);
      console.log(`  ✅ Added Sidebar navigation constants in: [${path.basename(shellConstantsPath)}](file://${shellConstantsPath})`);
    }
  }

  // 6. Add route in src/shell/main.ts
  const shellMainPath = path.join(projectRoot, 'src', 'shell', 'main.ts');
  if (fs.existsSync(shellMainPath)) {
    let mainContent = fs.readFileSync(shellMainPath, 'utf8');

    if (!mainContent.includes(`path: '/${kebabName}'`)) {
      const routeInsertIndex = mainContent.indexOf('// Component Example Routes');
      const endOfRouteComment = mainContent.indexOf('\n', routeInsertIndex);

      const routeRegistration = `    router.register({ path: '/${kebabName}', component: 'exba-${kebabName}' });\n`;
      mainContent = mainContent.slice(0, endOfRouteComment + 1) + routeRegistration + mainContent.slice(endOfRouteComment + 1);

      fs.writeFileSync(shellMainPath, mainContent);
      console.log(`  ✅ Registered route in App orchestrator: [${path.basename(shellMainPath)}](file://${shellMainPath})`);
    }
  }

  console.log('\n🧹 Formatting generated code with Biome linter...');
  try {
    execSync('bun run format', { stdio: 'ignore' });
    console.log('  ✅ Workspace formatted successfully.');
  } catch (e) {
    console.warn('  ⚠️ Formatting finished with minor warnings.');
  }

  console.log(`\n🎉 Success! feature "${titleName}" has been fully scaffolded.`);
  if (wasm) {
    console.log('👉 Please rebuild the application to compile your new Rust backend:');
    console.log('   `bun run build` and then `bun run dev`');
  } else {
    console.log('👉 Since this is a TS-only component, you can start your dev server directly:');
    console.log('   `bun run dev`');
  }
}

run().catch((e) => {
  console.error('Generation failed:', e);
  process.exit(1);
});
