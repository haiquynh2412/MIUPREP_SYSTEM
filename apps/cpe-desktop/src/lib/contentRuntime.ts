import type { IeltsTest, ValidationError } from '@miuprep/content';

type CpeSeedModule = typeof import('@miuprep/content/src/mocks/cpe-seed-tests');
type ValidatorModule = typeof import('@miuprep/content/src/validator');

let cpeSeedModulePromise: Promise<CpeSeedModule> | null = null;
let validatorModulePromise: Promise<ValidatorModule> | null = null;

function loadCpeSeedModule(): Promise<CpeSeedModule> {
  if (!cpeSeedModulePromise) {
    cpeSeedModulePromise = import('@miuprep/content/src/mocks/cpe-seed-tests');
  }
  return cpeSeedModulePromise;
}

function loadValidatorModule(): Promise<ValidatorModule> {
  if (!validatorModulePromise) {
    validatorModulePromise = import('@miuprep/content/src/validator');
  }
  return validatorModulePromise;
}

export async function loadCpeSeedTests(): Promise<IeltsTest[]> {
  const { loadCpeSeedTests: loadSeedTests } = await loadCpeSeedModule();
  return loadSeedTests();
}

export async function validateContentTest(test: unknown): Promise<ValidationError[]> {
  const { validateIeltsTest } = await loadValidatorModule();
  return validateIeltsTest(test);
}
