import type { IeltsTest, ValidationError } from '@miuprep/content';

type EnglishSeedTrack = 'ielts' | 'cpe' | 'cae';
type IeltsSeedModule = typeof import('@miuprep/content/src/mocks/ielts-seed-tests');
type CpeSeedModule = typeof import('@miuprep/content/src/mocks/cpe-seed-tests');
type CaeSeedModule = typeof import('@miuprep/content/src/mocks/cae-seed-tests');
type ValidatorModule = typeof import('@miuprep/content/src/validator');

let ieltsSeedModulePromise: Promise<IeltsSeedModule> | null = null;
let cpeSeedModulePromise: Promise<CpeSeedModule> | null = null;
let caeSeedModulePromise: Promise<CaeSeedModule> | null = null;
let validatorModulePromise: Promise<ValidatorModule> | null = null;

function loadIeltsSeedModule(): Promise<IeltsSeedModule> {
  if (!ieltsSeedModulePromise) {
    ieltsSeedModulePromise = import('@miuprep/content/src/mocks/ielts-seed-tests');
  }
  return ieltsSeedModulePromise;
}

function loadCpeSeedModule(): Promise<CpeSeedModule> {
  if (!cpeSeedModulePromise) {
    cpeSeedModulePromise = import('@miuprep/content/src/mocks/cpe-seed-tests');
  }
  return cpeSeedModulePromise;
}

function loadCaeSeedModule(): Promise<CaeSeedModule> {
  if (!caeSeedModulePromise) {
    caeSeedModulePromise = import('@miuprep/content/src/mocks/cae-seed-tests');
  }
  return caeSeedModulePromise;
}

function loadValidatorModule(): Promise<ValidatorModule> {
  if (!validatorModulePromise) {
    validatorModulePromise = import('@miuprep/content/src/validator');
  }
  return validatorModulePromise;
}

export async function loadEnglishSeedTests(
  tracks: EnglishSeedTrack[] = ['ielts', 'cpe', 'cae'],
): Promise<IeltsTest[]> {
  const lists = await Promise.all(tracks.map(loadSeedTestsForTrack));
  const seenIds = new Set<string>();
  return lists.flat().filter((test) => {
    if (seenIds.has(test.id)) return false;
    seenIds.add(test.id);
    return true;
  });
}

async function loadSeedTestsForTrack(track: EnglishSeedTrack): Promise<IeltsTest[]> {
  if (track === 'ielts') {
    const { IELTS_SEED_TESTS } = await loadIeltsSeedModule();
    return IELTS_SEED_TESTS;
  }
  if (track === 'cpe') {
    const { loadCpeSeedTests } = await loadCpeSeedModule();
    return loadCpeSeedTests();
  }
  const { loadCaeSeedTests } = await loadCaeSeedModule();
  return loadCaeSeedTests();
}

export async function validateContentTest(test: unknown): Promise<ValidationError[]> {
  const { validateIeltsTest } = await loadValidatorModule();
  return validateIeltsTest(test);
}
