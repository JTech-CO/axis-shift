import { readFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

import { PROJECT_ROOT, projectPath, walkFiles } from './lib/project-files.ts';

const SRC_ROOT = path.join(PROJECT_ROOT, 'src');
const INTERACTIVE_TAGS = new Set(['a', 'button', 'input', 'select', 'textarea']);
const INTERACTIVE_COMPONENTS = new Set(['Link', 'NavLink']);
const INTERACTIVE_ROLES = new Set(['button', 'checkbox', 'link', 'radio', 'switch', 'tab']);

function attribute(opening: ts.JsxOpeningLikeElement, name: string): ts.JsxAttribute | undefined {
  return opening.attributes.properties.find(
    (property): property is ts.JsxAttribute =>
      ts.isJsxAttribute(property) && property.name.getText() === name,
  );
}

function literalAttribute(opening: ts.JsxOpeningLikeElement, name: string): string | undefined {
  const candidate = attribute(opening, name)?.initializer;
  return candidate && ts.isStringLiteral(candidate) ? candidate.text : undefined;
}

function hasContent(node: ts.JsxElement): boolean {
  return node.children.some(
    (child) =>
      (ts.isJsxText(child) && child.text.trim().length > 0) ||
      ts.isJsxExpression(child) ||
      ts.isJsxElement(child) ||
      ts.isJsxSelfClosingElement(child),
  );
}

function hasAccessibleName(
  node: ts.JsxElement | ts.JsxSelfClosingElement,
  labelledInputIds: ReadonlySet<string>,
): boolean {
  const opening = ts.isJsxElement(node) ? node.openingElement : node;
  const tagName = opening.tagName.getText();
  if (literalAttribute(opening, 'aria-label')?.trim()) return true;
  if (attribute(opening, 'aria-labelledby')) return true;
  if (tagName === 'input' && literalAttribute(opening, 'type') === 'hidden') return true;
  const id = literalAttribute(opening, 'id');
  if (tagName === 'input' && id && labelledInputIds.has(id)) return true;
  if (ts.isJsxElement(node)) return hasContent(node);
  return false;
}

function undersizedMinimum(opening: ts.JsxOpeningLikeElement): string[] {
  const style = attribute(opening, 'style')?.initializer;
  if (
    !style ||
    !ts.isJsxExpression(style) ||
    !style.expression ||
    !ts.isObjectLiteralExpression(style.expression)
  ) {
    return [];
  }
  const violations: string[] = [];
  for (const property of style.expression.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = property.name.getText().replaceAll(/["']/gu, '');
    if (name !== 'minHeight' && name !== 'minWidth') continue;
    if (ts.isNumericLiteral(property.initializer) && Number(property.initializer.text) < 44) {
      violations.push(`${name}=${property.initializer.text}`);
    }
  }
  return violations;
}

async function main(): Promise<void> {
  const files = (await walkFiles(SRC_ROOT)).filter((filename) => filename.endsWith('.tsx'));
  const failures: string[] = [];
  let targets = 0;

  for (const filename of files) {
    const sourceText = await readFile(filename, 'utf8');
    const sourceFile = ts.createSourceFile(
      filename,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const labelledInputIds = new Set<string>();

    const collectLabels = (node: ts.Node): void => {
      if (ts.isJsxElement(node) && node.openingElement.tagName.getText() === 'label') {
        const target = literalAttribute(node.openingElement, 'htmlFor');
        if (target && hasContent(node)) labelledInputIds.add(target);
      }
      ts.forEachChild(node, collectLabels);
    };
    collectLabels(sourceFile);

    const visit = (node: ts.Node): void => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const opening = ts.isJsxElement(node) ? node.openingElement : node;
        const tagName = opening.tagName.getText();
        const role = literalAttribute(opening, 'role');
        if (
          INTERACTIVE_TAGS.has(tagName) ||
          INTERACTIVE_COMPONENTS.has(tagName) ||
          (role !== undefined && INTERACTIVE_ROLES.has(role))
        ) {
          targets += 1;
          const line =
            sourceFile.getLineAndCharacterOfPosition(opening.getStart(sourceFile)).line + 1;
          if (!hasAccessibleName(node, labelledInputIds)) {
            failures.push(
              `${projectPath(filename)}:${line} interactive target has no static accessible name`,
            );
          }
          for (const sizing of undersizedMinimum(opening)) {
            failures.push(
              `${projectPath(filename)}:${line} target explicitly sets ${sizing}, below 44px`,
            );
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }

  for (const failure of failures) console.error(`a11y-target: ${failure}`);
  console.log(
    `a11yTargetAudit files=${files.length} interactiveTargets=${targets} staticNames=true explicitInlineMinimums=true computedSizeChecks=0 failures=${failures.length}`,
  );
  if (failures.length > 0) process.exitCode = 1;
}

await main();
