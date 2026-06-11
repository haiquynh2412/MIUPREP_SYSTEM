import type { IeltsTest } from '../index';
import readingSample1 from './reading-sample-1.json';
import readingSample2 from './reading-sample-2.json';
import readingSample3 from './reading-sample-3.json';
import listeningSample1 from './listening-sample-1.json';
import listeningSample2 from './listening-sample-2.json';
import listeningSample3 from './listening-sample-3.json';

function asIeltsTest(test: unknown): IeltsTest {
  return { ...(test as Record<string, unknown>), exam: 'ielts' } as unknown as IeltsTest;
}

export const IELTS_SEED_TESTS: IeltsTest[] = [
  asIeltsTest(readingSample1),
  asIeltsTest(readingSample2),
  asIeltsTest(readingSample3),
  asIeltsTest(listeningSample1),
  asIeltsTest(listeningSample2),
  asIeltsTest(listeningSample3),
];
