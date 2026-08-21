import { ESLint } from 'eslint';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import ts from 'typescript';

import { PROJECT_ROOT, pathExists, projectPath, toPosix, walkFiles } from './lib/project-files.ts';

const SOURCE_EXTENSIONS = new Set(['.cts', '.js', '.jsx', '.mts', '.ts', '.tsx']);
const RESOLUTION_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx'] as const;
const ASSET_EXTENSIONS = new Set([
  '.css',
  '.gif',
  '.jpeg',
  '.jpg',
  '.json',
  '.png',
  '.svg',
  '.webp',
]);
const SRC_ROOT = path.join(PROJECT_ROOT, 'src');
const SCRIPTS_ROOT = path.join(PROJECT_ROOT, 'scripts');
const CORE_IMPLEMENTATION_NAMES = new Set([
  'applyPulse',
  'applyPulses',
  'factorizeGF2',
  'gf2Rank',
  'rankGF2',
]);
const CORE_SCAN_EXCLUDED_SEGMENTS = new Set([
  '__fixtures__',
  '__tests__',
  'fixture',
  'fixtures',
  'prototype',
  'prototypes',
  'test',
  'tests',
]);

type Layer =
  | 'app'
  | 'components-common'
  | 'components-game'
  | 'content'
  | 'domain'
  | 'features'
  | 'i18n'
  | 'root'
  | 'services'
  | 'unknown';

const CORE_IMPLEMENTATION_LAYERS = new Set<Layer>([
  'components-common',
  'components-game',
  'features',
  'services',
]);

interface ModuleInfo {
  readonly layer: Layer;
  readonly moduleRoot?: string;
  readonly name?: string;
}

interface ImportRecord {
  readonly line: number;
  readonly source: string;
}

interface GraphResult {
  readonly graph: Map<string, Set<string>>;
  readonly violations: string[];
}

function sourceKind(filename: string): ts.ScriptKind {
  if (filename.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (filename.endsWith('.jsx')) return ts.ScriptKind.JSX;
  if (filename.endsWith('.js')) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function moduleInfo(filename: string): ModuleInfo {
  const relative = toPosix(path.relative(SRC_ROOT, filename));
  const segments = relative.split('/');
  const first = segments[0];

  if (!first || first === '..') return { layer: 'unknown' };
  if (first === 'domain') return { layer: 'domain', moduleRoot: path.join(SRC_ROOT, 'domain') };
  if (first === 'content') return { layer: 'content', moduleRoot: path.join(SRC_ROOT, 'content') };
  if (first === 'i18n') return { layer: 'i18n', moduleRoot: path.join(SRC_ROOT, 'i18n') };
  if (first === 'app') return { layer: 'app', moduleRoot: path.join(SRC_ROOT, 'app') };
  if (first === 'services') {
    const name = segments[1];
    return {
      layer: 'services',
      moduleRoot: name ? path.join(SRC_ROOT, 'services', name) : path.join(SRC_ROOT, 'services'),
      name,
    };
  }
  if (first === 'features') {
    const name = segments[1];
    return {
      layer: 'features',
      moduleRoot: name ? path.join(SRC_ROOT, 'features', name) : path.join(SRC_ROOT, 'features'),
      name,
    };
  }
  if (first === 'components') {
    const name = segments[1];
    return {
      layer: name === 'game' ? 'components-game' : 'components-common',
      moduleRoot: name
        ? path.join(SRC_ROOT, 'components', name)
        : path.join(SRC_ROOT, 'components'),
      name,
    };
  }
  if (!relative.includes('/')) return { layer: 'root' };
  return { layer: 'unknown' };
}

function importsFrom(sourceText: string, filename: string): ImportRecord[] {
  const sourceFile = ts.createSourceFile(
    filename,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    sourceKind(filename),
  );
  const imports: ImportRecord[] = [];

  const add = (literal: ts.StringLiteralLike): void => {
    const line = sourceFile.getLineAndCharacterOfPosition(literal.getStart(sourceFile)).line + 1;
    imports.push({ line, source: literal.text });
  };

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
      add(node.moduleSpecifier);
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      add(node.moduleSpecifier);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      add(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return imports;
}

async function resolveSourceFile(basePath: string): Promise<string | undefined> {
  const extension = path.extname(basePath);
  const candidates: string[] = [];

  if (SOURCE_EXTENSIONS.has(extension)) {
    candidates.push(basePath);
    if (extension === '.js' || extension === '.jsx') {
      const stem = basePath.slice(0, -extension.length);
      candidates.push(
        ...RESOLUTION_EXTENSIONS.map((candidateExtension) => stem + candidateExtension),
      );
    }
  } else if (!extension) {
    candidates.push(
      ...RESOLUTION_EXTENSIONS.map((candidateExtension) => basePath + candidateExtension),
    );
    candidates.push(
      ...RESOLUTION_EXTENSIONS.map((candidateExtension) =>
        path.join(basePath, `index${candidateExtension}`),
      ),
    );
  }

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return path.resolve(candidate);
    }
  }
  return undefined;
}

async function resolveImport(fromFile: string, specifier: string): Promise<string | undefined> {
  if (specifier.startsWith('@/')) {
    return resolveSourceFile(path.join(SRC_ROOT, specifier.slice(2)));
  }
  if (specifier.startsWith('.')) {
    return resolveSourceFile(path.resolve(path.dirname(fromFile), specifier));
  }
  return undefined;
}

function isInternalSpecifier(specifier: string): boolean {
  return specifier.startsWith('@/') || specifier.startsWith('.');
}

function isAllowedLayerImport(from: ModuleInfo, to: ModuleInfo): boolean {
  switch (from.layer) {
    case 'domain':
      return to.layer === 'domain';
    case 'content':
      return to.layer === 'content' || to.layer === 'domain';
    case 'services':
      return (
        to.layer === 'domain' ||
        to.layer === 'content' ||
        (to.layer === 'services' && from.name === to.name)
      );
    case 'components-common':
      return to.layer === 'components-common';
    case 'components-game':
      return ['components-common', 'components-game', 'domain'].includes(to.layer);
    case 'features':
      return (
        ['components-common', 'components-game', 'content', 'domain', 'i18n', 'services'].includes(
          to.layer,
        ) ||
        (to.layer === 'features' && from.name === to.name)
      );
    case 'i18n':
      return to.layer === 'i18n';
    case 'app':
      return ['app', 'components-common', 'domain', 'features', 'i18n', 'services'].includes(
        to.layer,
      );
    case 'root':
      return ['app', 'i18n'].includes(to.layer);
    default:
      return false;
  }
}

function requiresPublicEntrypoint(info: ModuleInfo): boolean {
  return [
    'components-common',
    'components-game',
    'domain',
    'features',
    'i18n',
    'services',
  ].includes(info.layer);
}

function crossesModuleBoundary(from: ModuleInfo, to: ModuleInfo): boolean {
  if (!to.moduleRoot) return false;
  if (!from.moduleRoot) return true;
  return path.resolve(from.moduleRoot) !== path.resolve(to.moduleRoot);
}

function isPublicEntrypoint(filename: string, info: ModuleInfo): boolean {
  if (!info.moduleRoot) return true;
  const relative = toPosix(path.relative(info.moduleRoot, filename));
  return /^index\.(?:cts|js|jsx|mts|ts|tsx)$/u.test(relative);
}

function domainGlobalViolations(sourceText: string, filename: string): string[] {
  if (moduleInfo(filename).layer !== 'domain') return [];

  const sourceFile = ts.createSourceFile(
    filename,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    sourceKind(filename),
  );
  const forbidden = new Set([
    'Date',
    'XMLHttpRequest',
    'crypto',
    'document',
    'fetch',
    'localStorage',
    'navigator',
    'performance',
    'sessionStorage',
    'setTimeout',
    'window',
  ]);
  const violations: string[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && forbidden.has(node.text)) {
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
      violations.push(`${projectPath(filename)}:${line} forbidden domain global ${node.text}`);
    }
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'Math' &&
      node.name.text === 'random'
    ) {
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
      violations.push(`${projectPath(filename)}:${line} Math.random() is forbidden in domain code`);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return [...new Set(violations)];
}

function browserServiceGlobalViolations(sourceText: string, filename: string): string[] {
  const layer = moduleInfo(filename).layer;
  if (!['components-common', 'components-game', 'features'].includes(layer)) return [];

  const sourceFile = ts.createSourceFile(
    filename,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    sourceKind(filename),
  );
  const forbidden = new Set([
    'XMLHttpRequest',
    'fetch',
    'localStorage',
    'navigator',
    'sessionStorage',
  ]);
  const violations: string[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && forbidden.has(node.text)) {
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
      violations.push(
        `${projectPath(filename)}:${line} ${node.text} must be accessed through a service adapter`,
      );
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return [...new Set(violations)];
}

function declaredName(name: ts.DeclarationName | undefined): string | undefined {
  if (name && (ts.isIdentifier(name) || ts.isStringLiteralLike(name))) return name.text;
  return undefined;
}

function isFunctionInitializer(node: ts.Expression | undefined): boolean {
  return Boolean(node && (ts.isArrowFunction(node) || ts.isFunctionExpression(node)));
}

function coreImplementationViolations(sourceText: string, filename: string): string[] {
  const sourceFile = ts.createSourceFile(
    filename,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    sourceKind(filename),
  );
  const violations: string[] = [];

  const report = (node: ts.Node, name: string | undefined): void => {
    if (!name || !CORE_IMPLEMENTATION_NAMES.has(name)) return;
    const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
    violations.push(
      `${projectPath(filename)}:${line} duplicates domain core implementation ${name}`,
    );
  };

  const visit = (node: ts.Node): void => {
    if (ts.isFunctionDeclaration(node) && node.body) {
      report(node, node.name?.text);
    } else if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      isFunctionInitializer(node.initializer)
    ) {
      report(node, node.name.text);
    } else if (ts.isMethodDeclaration(node) && node.body) {
      report(node, declaredName(node.name));
    } else if (
      (ts.isPropertyAssignment(node) || ts.isPropertyDeclaration(node)) &&
      isFunctionInitializer(node.initializer)
    ) {
      report(node, declaredName(node.name));
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return violations;
}

function isCoreImplementationScanFile(filename: string): boolean {
  if (!SOURCE_EXTENSIONS.has(path.extname(filename))) return false;

  const relative = toPosix(path.relative(PROJECT_ROOT, filename));
  const segments = relative.toLowerCase().split('/');
  const basenameSegments = path.basename(relative).toLowerCase().split('.');
  if (
    segments.some((segment) => CORE_SCAN_EXCLUDED_SEGMENTS.has(segment)) ||
    basenameSegments.some((segment) => CORE_SCAN_EXCLUDED_SEGMENTS.has(segment)) ||
    /\.(?:test|spec)\.[^.]+$/u.test(relative)
  ) {
    return false;
  }

  if (segments[0] === 'scripts') return true;
  return CORE_IMPLEMENTATION_LAYERS.has(moduleInfo(filename).layer);
}

async function findCoreImplementationViolations(files: readonly string[]): Promise<string[]> {
  const violations: string[] = [];
  for (const filename of files) {
    if (!isCoreImplementationScanFile(filename)) continue;
    violations.push(
      ...coreImplementationViolations(await readFile(path.resolve(filename), 'utf8'), filename),
    );
  }
  return violations;
}

async function buildGraph(files: readonly string[]): Promise<GraphResult> {
  const graph = new Map<string, Set<string>>();
  const violations: string[] = [];

  for (const filename of files) {
    const absoluteFilename = path.resolve(filename);
    graph.set(absoluteFilename, new Set());
    const sourceText = await readFile(absoluteFilename, 'utf8');
    violations.push(...domainGlobalViolations(sourceText, absoluteFilename));
    violations.push(...browserServiceGlobalViolations(sourceText, absoluteFilename));

    for (const record of importsFrom(sourceText, absoluteFilename)) {
      const resolved = await resolveImport(absoluteFilename, record.source);
      const fromInfo = moduleInfo(absoluteFilename);

      if (!isInternalSpecifier(record.source)) {
        if (fromInfo.layer === 'domain') {
          violations.push(
            `${projectPath(absoluteFilename)}:${record.line} domain cannot import external module "${record.source}"`,
          );
        }
        continue;
      }

      if (!resolved) {
        if (!ASSET_EXTENSIONS.has(path.extname(record.source))) {
          violations.push(
            `${projectPath(absoluteFilename)}:${record.line} unresolved internal import "${record.source}"`,
          );
        }
        continue;
      }

      graph.get(absoluteFilename)?.add(resolved);
      const toInfo = moduleInfo(resolved);
      if (!isAllowedLayerImport(fromInfo, toInfo)) {
        violations.push(
          `${projectPath(absoluteFilename)}:${record.line} forbidden ${fromInfo.layer} -> ${toInfo.layer} import "${record.source}"`,
        );
      }

      if (
        requiresPublicEntrypoint(toInfo) &&
        crossesModuleBoundary(fromInfo, toInfo) &&
        !isPublicEntrypoint(resolved, toInfo)
      ) {
        violations.push(
          `${projectPath(absoluteFilename)}:${record.line} bypasses public entrypoint with "${record.source}"`,
        );
      }
    }
  }

  return { graph, violations };
}

function findCycles(graph: ReadonlyMap<string, ReadonlySet<string>>): string[][] {
  const state = new Map<string, 'active' | 'done'>();
  const stack: string[] = [];
  const cycles: string[][] = [];
  const fingerprints = new Set<string>();

  const visit = (node: string): void => {
    state.set(node, 'active');
    stack.push(node);

    for (const dependency of graph.get(node) ?? []) {
      if (!graph.has(dependency)) continue;
      if (!state.has(dependency)) {
        visit(dependency);
      } else if (state.get(dependency) === 'active') {
        const start = stack.indexOf(dependency);
        const cycle = [...stack.slice(start), dependency];
        const fingerprint = [...new Set(cycle)].sort().join('|');
        if (!fingerprints.has(fingerprint)) {
          fingerprints.add(fingerprint);
          cycles.push(cycle);
        }
      }
    }

    stack.pop();
    state.set(node, 'done');
  };

  for (const node of graph.keys()) {
    if (!state.has(node)) visit(node);
  }
  return cycles;
}

async function proveEslintBoundaries(): Promise<void> {
  const domainFixture = path.join(SRC_ROOT, 'domain', '__axis_boundary_fixture_domain.ts');
  const featureA = path.join(SRC_ROOT, 'features', '__axis_boundary_fixture_a');
  const featureB = path.join(SRC_ROOT, 'features', '__axis_boundary_fixture_b');
  const componentFixture = path.join(
    SRC_ROOT,
    'components',
    'common',
    '__axis_boundary_fixture_component.ts',
  );
  const fixturePaths = [domainFixture, featureA, featureB, componentFixture] as const;

  for (const fixturePath of fixturePaths) {
    if (await pathExists(fixturePath)) {
      throw new Error(`Refusing to overwrite boundary fixture path: ${projectPath(fixturePath)}`);
    }
  }

  try {
    await mkdir(path.dirname(domainFixture), { recursive: true });
    await mkdir(featureA, { recursive: true });
    await mkdir(featureB, { recursive: true });
    await mkdir(path.dirname(componentFixture), { recursive: true });
    await writeFile(path.join(featureB, 'index.ts'), 'export const fixture = true;\n', 'utf8');

    const aliasPrefix = String.fromCharCode(64);
    await writeFile(
      domainFixture,
      "import 'react';" +
        String.fromCharCode(10) +
        "import '" +
        aliasPrefix +
        "/services';" +
        String.fromCharCode(10) +
        'export const fixture = document.body;' +
        String.fromCharCode(10),
      'utf8',
    );
    await writeFile(
      path.join(featureA, 'index.ts'),
      "import '" +
        aliasPrefix +
        "/features/__axis_boundary_fixture_b';" +
        String.fromCharCode(10) +
        "export const fixture = fetch('/fixture');" +
        String.fromCharCode(10),
      'utf8',
    );
    await writeFile(
      componentFixture,
      "import '" +
        aliasPrefix +
        "/services';" +
        String.fromCharCode(10) +
        "export const fixture = localStorage.getItem('fixture');" +
        String.fromCharCode(10),
      'utf8',
    );

    const eslint = new ESLint({ cwd: PROJECT_ROOT });
    const results = await eslint.lintFiles([
      domainFixture,
      path.join(featureA, 'index.ts'),
      path.join(featureB, 'index.ts'),
      componentFixture,
    ]);
    const messagesFor = (filename: string) =>
      results.find((result) => path.resolve(result.filePath) === path.resolve(filename))
        ?.messages ?? [];
    const domainMessages = messagesFor(domainFixture);
    const featureMessages = messagesFor(path.join(featureA, 'index.ts'));
    const componentMessages = messagesFor(componentFixture);
    const domainImportsRejected =
      domainMessages.filter((message) => message.ruleId === 'no-restricted-imports').length >= 2;
    const domainGlobalRejected = domainMessages.some(
      (message) => message.ruleId === 'no-restricted-globals',
    );
    const featureBoundaryRejected = featureMessages.some(
      (message) => message.ruleId === 'axis-shift/no-cross-feature-imports',
    );
    const featureGlobalRejected = featureMessages.some(
      (message) => message.ruleId === 'no-restricted-globals',
    );
    const componentImportRejected = componentMessages.some(
      (message) => message.ruleId === 'no-restricted-imports',
    );
    const componentGlobalRejected = componentMessages.some(
      (message) => message.ruleId === 'no-restricted-globals',
    );

    if (
      !domainImportsRejected ||
      !domainGlobalRejected ||
      !featureBoundaryRejected ||
      !featureGlobalRejected ||
      !componentImportRejected ||
      !componentGlobalRejected
    ) {
      throw new Error(
        'ESLint boundary fixture failed: ' +
          JSON.stringify({
            componentGlobalRejected,
            componentImportRejected,
            domainGlobalRejected,
            domainImportsRejected,
            featureBoundaryRejected,
            featureGlobalRejected,
          }),
      );
    }
  } finally {
    await rm(domainFixture, { force: true });
    await rm(featureA, { force: true, recursive: true });
    await rm(featureB, { force: true, recursive: true });
    await rm(componentFixture, { force: true });
  }
}

async function proveCycleDetection(): Promise<void> {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'axis-shift-cycle-'));
  const first = path.join(fixtureRoot, 'first.ts');
  const second = path.join(fixtureRoot, 'second.ts');

  try {
    await writeFile(first, "import './second';\nexport const first = true;\n", 'utf8');
    await writeFile(second, "import './first';\nexport const second = true;\n", 'utf8');
    const { graph } = await buildGraph([first, second]);
    if (findCycles(graph).length === 0) {
      throw new Error('Cycle fixture was not detected.');
    }
  } finally {
    await rm(fixtureRoot, { force: true, recursive: true });
  }
}

async function proveCoreImplementationDetection(): Promise<void> {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'axis-shift-core-boundary-'));
  const duplicateFixture = path.join(fixtureRoot, 'duplicate.ts');
  const allowedFixture = path.join(fixtureRoot, 'allowed.ts');

  try {
    await writeFile(
      duplicateFixture,
      [
        'function applyPulse() {}',
        'const applyPulses = () => undefined;',
        'const rankGF2 = function () {};',
        'class Fixture { gf2Rank() {} }',
        'const fixture = { factorizeGF2() {} };',
        '',
      ].join('\n'),
      'utf8',
    );
    await writeFile(
      allowedFixture,
      [
        "import { applyPulse, applyPulses, factorizeGF2, gf2Rank, rankGF2 } from './domain';",
        'export const result = [applyPulse(), applyPulses(), factorizeGF2(), gf2Rank(), rankGF2()];',
        '',
      ].join('\n'),
      'utf8',
    );

    const duplicateViolations = coreImplementationViolations(
      await readFile(duplicateFixture, 'utf8'),
      duplicateFixture,
    );
    const allowedViolations = coreImplementationViolations(
      await readFile(allowedFixture, 'utf8'),
      allowedFixture,
    );
    const detectedNames = new Set(
      duplicateViolations.map((violation) => violation.slice(violation.lastIndexOf(' ') + 1)),
    );

    if (
      duplicateViolations.length !== CORE_IMPLEMENTATION_NAMES.size ||
      [...CORE_IMPLEMENTATION_NAMES].some((name) => !detectedNames.has(name))
    ) {
      throw new Error(
        `Core implementation fixture failed to detect all duplicates: ${JSON.stringify(duplicateViolations)}`,
      );
    }
    if (allowedViolations.length > 0) {
      throw new Error(
        `Core implementation fixture rejected imports or calls: ${JSON.stringify(allowedViolations)}`,
      );
    }
  } finally {
    await rm(fixtureRoot, { force: true, recursive: true });
  }
}

async function main(): Promise<void> {
  const files = (await walkFiles(SRC_ROOT)).filter((filename) => {
    const relative = toPosix(path.relative(SRC_ROOT, filename));
    return (
      SOURCE_EXTENSIONS.has(path.extname(filename)) &&
      !relative.startsWith('test/') &&
      !/\.(?:test|spec)\.[^.]+$/u.test(relative)
    );
  });
  if (files.length === 0) {
    throw new Error('Boundary scan requires at least one source file under src/.');
  }

  const { graph, violations } = await buildGraph(files);
  const scriptFiles = await walkFiles(SCRIPTS_ROOT);
  const coreScanFiles = [...files, ...scriptFiles].filter(isCoreImplementationScanFile);
  violations.push(...(await findCoreImplementationViolations(coreScanFiles)));
  const cycles = findCycles(graph);
  await proveEslintBoundaries();
  await proveCycleDetection();
  await proveCoreImplementationDetection();

  for (const violation of violations) console.error(`boundary: ${violation}`);
  for (const cycle of cycles) {
    console.error(`cycle: ${cycle.map((filename) => projectPath(filename)).join(' -> ')}`);
  }

  console.log(
    `boundaries files=${files.length} edges=${[...graph.values()].reduce((sum, edges) => sum + edges.size, 0)} violations=${violations.length} cycles=${cycles.length} lintFixtures=4 lintAssertions=7 cycleFixtures=1 coreFiles=${coreScanFiles.length} coreFixtureImplementations=${CORE_IMPLEMENTATION_NAMES.size} coreFixtureAssertions=2`,
  );
  if (violations.length > 0 || cycles.length > 0) process.exitCode = 1;
}

await main();
