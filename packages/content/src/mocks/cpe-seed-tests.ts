import type { IeltsTest } from '../index';

type JsonModule = { default: unknown };
type JsonLoader = () => Promise<JsonModule>;
type SeedTestLoader = () => Promise<IeltsTest>;

function asCpeTest(test: unknown): IeltsTest {
  return { ...(test as Record<string, unknown>), exam: 'cpe' } as unknown as IeltsTest;
}

function loadCpeJson(loader: JsonLoader): Promise<IeltsTest> {
  return loader().then((module) => asCpeTest(module.default));
}

const CPE_SEED_TEST_LOADERS: SeedTestLoader[] = [
  () => loadCpeJson(() => import('./cpe-sample-1.json')),
  () => loadCpeJson(() => import('./cpe-practice-test1-book3.json')),
  () => loadCpeJson(() => import('./cpe-practice-test2-book3.json')),
  () => loadCpeJson(() => import('./cpe-practice-test3-book3.json')),
  () => loadCpeJson(() => import('./cpe-practice-test4-book3.json')),
  () => loadCpeJson(() => import('./cpe-practice-test5-book3.json')),
  () => loadCpeJson(() => import('./cpe-practice-test6-book3.json')),
  () => loadCpeJson(() => import('./cpe2-test1.json')),
  () => loadCpeJson(() => import('./cpe2-test2.json')),
  () => loadCpeJson(() => import('./cpe2-test3.json')),
  () => loadCpeJson(() => import('./cpe2-test4.json')),
  () => loadCpeJson(() => import('./cpe2-test5.json')),
  () => loadCpeJson(() => import('./cpe2-test6.json')),
  () => loadCpeJson(() => import('./cam-cpe1-test1.json')),
  () => loadCpeJson(() => import('./cam-cpe1-test2.json')),
  () => loadCpeJson(() => import('./cam-cpe1-test3.json')),
  () => loadCpeJson(() => import('./cam-cpe1-test4.json')),
  () => loadCpeJson(() => import('./camcp2-test1.json')),
  () => loadCpeJson(() => import('./camcp2-test2.json')),
  () => loadCpeJson(() => import('./camcp2-test3.json')),
  () => loadCpeJson(() => import('./camcp2-test4.json')),
  () => loadCpeJson(() => import('./camcp2-listening-topic-bank.json')),
  () => loadCpeJson(() => import('./camcp3-test1.json')),
  () => loadCpeJson(() => import('./camcp3-test2.json')),
  () => loadCpeJson(() => import('./camcp3-test3.json')),
  () => loadCpeJson(() => import('./camcp3-test4.json')),
  () => loadCpeJson(() => import('./camcp3-listening-topic-bank.json')),
  () => loadCpeJson(() => import('./camcp4-test1.json')),
  () => loadCpeJson(() => import('./camcp4-test2.json')),
  () => loadCpeJson(() => import('./camcp4-test3.json')),
  () => loadCpeJson(() => import('./camcp4-test4.json')),
  () => loadCpeJson(() => import('./camcp4-listening-topic-bank.json')),
  () => loadCpeJson(() => import('./camcp5-test1.json')),
  () => loadCpeJson(() => import('./camcp5-test2.json')),
  () => loadCpeJson(() => import('./camcp5-test3.json')),
  () => loadCpeJson(() => import('./camcp5-test4.json')),
  () => loadCpeJson(() => import('./camcp5-listening-topic-bank.json')),
  () => loadCpeJson(() => import('./cpe-entry-test1.json')),
  () => loadCpeJson(() => import('./cpe-entry-test2.json')),
  () => loadCpeJson(() => import('./cpe-entry-test3.json')),
  () => loadCpeJson(() => import('./cpe-entry-test4.json')),
  () => loadCpeJson(() => import('./cpe-entry-test5.json')),
  () => loadCpeJson(() => import('./cpe-entry-test6.json')),
  () => loadCpeJson(() => import('./cpe-entry-test7.json')),
  () => loadCpeJson(() => import('./cpe-entry-test8.json')),
  () => loadCpeJson(() => import('./cpe-entry-test9.json')),
  () => loadCpeJson(() => import('./cpe-entry-test10.json')),
];

export function loadCpeSeedTests(): Promise<IeltsTest[]> {
  return Promise.all(CPE_SEED_TEST_LOADERS.map((loadTest) => loadTest()));
}
