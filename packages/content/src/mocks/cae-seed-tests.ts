import type { IeltsTest } from '../index';

type JsonModule = { default: unknown };
type JsonLoader = () => Promise<JsonModule>;
type SeedTestLoader = () => Promise<IeltsTest>;

function asCaeTest(test: unknown): IeltsTest {
  return { ...(test as Record<string, unknown>), exam: 'cae' } as unknown as IeltsTest;
}

function loadCaeJson(loader: JsonLoader): Promise<IeltsTest> {
  return loader().then((module) => asCaeTest(module.default));
}

const CAE_SEED_TEST_LOADERS: SeedTestLoader[] = [
  () => loadCaeJson(() => import('./cae-error-correction-bank.json')),
  () => loadCaeJson(() => import('./cae-official-practice-test1.json')),
  () => loadCaeJson(() => import('./cam-cae-plus1-test1.json')),
  () => loadCaeJson(() => import('./cam-cae-plus1-test2.json')),
  () => loadCaeJson(() => import('./cam-cae-plus1-test3.json')),
  () => loadCaeJson(() => import('./cam-cae-plus1-test4.json')),
  () => loadCaeJson(() => import('./cam-cae-plus1-test5.json')),
  () => loadCaeJson(() => import('./cam-cae1-listening-topic-bank.json')),
  () => loadCaeJson(() => import('./cam-cae1-test1.json')),
  () => loadCaeJson(() => import('./cam-cae1-test2.json')),
  () => loadCaeJson(() => import('./cam-cae1-test3.json')),
  () => loadCaeJson(() => import('./cam-cae1-test4.json')),
  () => loadCaeJson(() => import('./cam-cae2-listening-topic-bank.json')),
  () => loadCaeJson(() => import('./cam-cae2-test1.json')),
  () => loadCaeJson(() => import('./cam-cae2-test2.json')),
  () => loadCaeJson(() => import('./cam-cae2-test3.json')),
  () => loadCaeJson(() => import('./cam-cae2-test4.json')),
  () => loadCaeJson(() => import('./cam-cae3-listening-topic-bank.json')),
  () => loadCaeJson(() => import('./cam-cae3-test1.json')),
  () => loadCaeJson(() => import('./cam-cae3-test2.json')),
  () => loadCaeJson(() => import('./cam-cae3-test3.json')),
  () => loadCaeJson(() => import('./cam-cae3-test4.json')),
  () => loadCaeJson(() => import('./cam-cae4-listening-topic-bank.json')),
  () => loadCaeJson(() => import('./cam-cae4-test1.json')),
  () => loadCaeJson(() => import('./cam-cae4-test2.json')),
  () => loadCaeJson(() => import('./cam-cae4-test3.json')),
  () => loadCaeJson(() => import('./cam-cae4-test4.json')),
  () => loadCaeJson(() => import('./cam-cae5-test1.json')),
  () => loadCaeJson(() => import('./cam-cae5-test2.json')),
  () => loadCaeJson(() => import('./cam-cae5-test3.json')),
  () => loadCaeJson(() => import('./cam-cae5-test4.json')),
  () => loadCaeJson(() => import('./cam-cae6-listening-topic-bank.json')),
  () => loadCaeJson(() => import('./cam-cae6-test1.json')),
  () => loadCaeJson(() => import('./cam-cae6-test2.json')),
  () => loadCaeJson(() => import('./cam-cae6-test3.json')),
  () => loadCaeJson(() => import('./cam-cae6-test4.json')),
];

export function loadCaeSeedTests(): Promise<IeltsTest[]> {
  return Promise.all(CAE_SEED_TEST_LOADERS.map((loadTest) => loadTest()));
}
