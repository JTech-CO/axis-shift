import * as contentModule from '../../src/content/index.ts';
import * as generatorModule from '../../src/domain/generator/index.ts';

type ModuleExports = Readonly<Record<string, unknown>>;

export interface GeneratorParityBridge {
  readonly contentExports: readonly string[];
  readonly generatorExports: readonly string[];
  callContent(name: string, arguments_: readonly unknown[]): Promise<unknown>;
  callGenerator(name: string, arguments_: readonly unknown[]): Promise<unknown>;
}

async function callExport(
  module: ModuleExports,
  name: string,
  arguments_: readonly unknown[],
): Promise<unknown> {
  const candidate = module[name];
  if (typeof candidate !== 'function') {
    throw new TypeError(`Generator parity export ${name} is not callable.`);
  }
  return await Reflect.apply(candidate, undefined, [...arguments_]);
}

const bridge: GeneratorParityBridge = Object.freeze({
  contentExports: Object.freeze(Object.keys(contentModule).sort()),
  generatorExports: Object.freeze(Object.keys(generatorModule).sort()),
  callContent: (name: string, arguments_: readonly unknown[]) =>
    callExport(contentModule, name, arguments_),
  callGenerator: (name: string, arguments_: readonly unknown[]) =>
    callExport(generatorModule, name, arguments_),
});

Object.assign(globalThis, { __AXIS_SHIFT_GENERATOR_PARITY__: bridge });

const parityGlobal = globalThis as typeof globalThis & {
  readonly document?: {
    querySelector(selector: string): { textContent: string | null } | null;
  };
};
const status = parityGlobal.document?.querySelector('#generator-parity-status');
if (status) status.textContent = 'Generator parity harness ready';
