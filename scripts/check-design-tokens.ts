import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const componentRoots = [
  'src/components/common',
  'src/components/game',
  'src/components/layout',
] as const;

const annotationPattern = /token-audit:\s*(calculation|transparency|breakpoint)\b/gi;
const rawBrandColorPattern = /#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i;
const rawDurationPattern = /(?<![\w-])\d*\.?\d+(?:ms|s)\b/i;
const rawLengthPattern = /(?<![\w-])-?\d*\.?\d+(?:px|r?em|vw|vh)\b/gi;

interface CssFragment {
  readonly line: number;
  readonly source: string;
}

async function collectCssFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectCssFiles(entryPath);
      return entry.isFile() && entry.name.endsWith('.css') ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

function withoutComments(value: string): string {
  return value.replace(/\/\*[\s\S]*?\*\//g, '');
}

function annotations(value: string): string[] {
  return Array.from(value.matchAll(annotationPattern), (match) => match[1]?.toLowerCase() ?? '');
}

function collectFragments(source: string): {
  readonly declarations: readonly CssFragment[];
  readonly media: readonly CssFragment[];
} {
  const lines = source.split(/\r?\n/);
  const declarations: CssFragment[] = [];
  const media: CssFragment[] = [];
  let declarationStart = -1;
  let declarationLines: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    if (/^\s*@media\b/.test(line)) {
      media.push({ line: index + 1, source: line + '\n' + (lines[index + 1] ?? '') });
    }

    if (declarationStart < 0 && /^\s*(?:--[\w-]+|[a-z-]+)\s*:/i.test(line)) {
      declarationStart = index;
      declarationLines = [line];
    } else if (declarationStart >= 0) {
      declarationLines.push(line);
    }

    if (declarationStart >= 0 && line.includes(';')) {
      declarations.push({ line: declarationStart + 1, source: declarationLines.join('\n') });
      declarationStart = -1;
      declarationLines = [];
    }
  }

  return { declarations, media };
}

const files = (await Promise.all(componentRoots.map(collectCssFiles))).flat().sort();
const violations: string[] = [];
let brandColorHardcodes = 0;
let durationHardcodes = 0;
let radiusHardcodes = 0;
let spacingHardcodes = 0;
let exceptionAnnotations = 0;

for (const file of files) {
  const source = await readFile(file, 'utf8');
  const fragments = collectFragments(source);
  const discoveredAnnotations = annotations(source).length;
  let validatedAnnotations = 0;

  for (const media of fragments.media) {
    const mediaAnnotations = annotations(media.source);
    if (mediaAnnotations.length > 0) {
      validatedAnnotations += mediaAnnotations.length;
      if (mediaAnnotations.length !== 1 || mediaAnnotations[0] !== 'breakpoint') {
        violations.push(file + ':' + media.line + ' invalid media token-audit annotation');
      }
    }

    const rawLengths = withoutComments(media.source).match(rawLengthPattern) ?? [];
    if (rawLengths.length > 0 && !mediaAnnotations.includes('breakpoint')) {
      spacingHardcodes += rawLengths.length;
      violations.push(file + ':' + media.line + ' unannotated breakpoint ' + rawLengths.join(', '));
    }
  }

  for (const declaration of fragments.declarations) {
    const declarationAnnotations = annotations(declaration.source);
    const line = withoutComments(declaration.source);
    const location = file + ':' + declaration.line;
    validatedAnnotations += declarationAnnotations.length;

    for (const annotation of declarationAnnotations) {
      const valid =
        (annotation === 'calculation' && /\b(?:calc|min|max|clamp)\(/.test(line)) ||
        (annotation === 'transparency' && /\bcolor-mix\(/.test(line));
      if (!valid) violations.push(location + ' invalid declaration token-audit annotation');
    }

    if (rawBrandColorPattern.test(line)) {
      brandColorHardcodes += 1;
      violations.push(location + ' brand color literal');
    }
    if (rawDurationPattern.test(line)) {
      durationHardcodes += 1;
      violations.push(location + ' motion duration literal');
    }

    const radius = line.match(/\bborder-radius\s*:\s*([^;]+)/i)?.[1]?.trim();
    if (radius && !radius.includes('var(') && !/^0(?:\s+0){0,3}$/.test(radius)) {
      radiusHardcodes += 1;
      violations.push(location + ' radius literal');
    }

    const rawLengths = line.match(rawLengthPattern) ?? [];
    const annotatedCalculation =
      declarationAnnotations.includes('calculation') && /\b(?:calc|min|max|clamp)\(/.test(line);
    if (rawLengths.length > 0 && !annotatedCalculation) {
      spacingHardcodes += rawLengths.length;
      violations.push(location + ' raw design length ' + rawLengths.join(', '));
    }
  }

  if (validatedAnnotations !== discoveredAnnotations) {
    violations.push(
      file +
        ':1 orphan token-audit annotations discovered=' +
        discoveredAnnotations +
        ' validated=' +
        validatedAnnotations,
    );
  }
  exceptionAnnotations += discoveredAnnotations;
}

console.log(
  '[design-tokens] files=' +
    files.length +
    ' brandColorHardcodes=' +
    brandColorHardcodes +
    ' spacingHardcodes=' +
    spacingHardcodes +
    ' radiusHardcodes=' +
    radiusHardcodes +
    ' durationHardcodes=' +
    durationHardcodes +
    ' exceptionAnnotations=' +
    exceptionAnnotations,
);

if (violations.length > 0) {
  throw new Error('Design token audit failed:\n' + violations.join('\n'));
}
