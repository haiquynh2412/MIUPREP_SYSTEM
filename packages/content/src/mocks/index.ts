import type { IeltsTest } from '../index';
import readingSample1 from './reading-sample-1.json';
import readingSample2 from './reading-sample-2.json';
import readingSample3 from './reading-sample-3.json';
import listeningSample1 from './listening-sample-1.json';
import listeningSample2 from './listening-sample-2.json';
import listeningSample3 from './listening-sample-3.json';
import goldenDataset from './golden-dataset.json';
import cpeSample1 from './cpe-sample-1.json';
import cpePracticeTest1Book3 from './cpe-practice-test1-book3.json';
import cpePracticeTest2Book3 from './cpe-practice-test2-book3.json';
import cpePracticeTest3Book3 from './cpe-practice-test3-book3.json';
import cpePracticeTest4Book3 from './cpe-practice-test4-book3.json';
import cpePracticeTest5Book3 from './cpe-practice-test5-book3.json';
import cpePracticeTest6Book3 from './cpe-practice-test6-book3.json';
import cpe2Test1 from './cpe2-test1.json';
import cpe2Test2 from './cpe2-test2.json';
import cpe2Test3 from './cpe2-test3.json';
import cpe2Test4 from './cpe2-test4.json';
import cpe2Test5 from './cpe2-test5.json';
import cpe2Test6 from './cpe2-test6.json';
import camCpe1Test1 from './cam-cpe1-test1.json';
import camCpe1Test2 from './cam-cpe1-test2.json';
import camCpe1Test3 from './cam-cpe1-test3.json';
import camCpe1Test4 from './cam-cpe1-test4.json';
import camcp2Test1 from './camcp2-test1.json';
import camcp2Test2 from './camcp2-test2.json';
import camcp2Test3 from './camcp2-test3.json';
import camcp2Test4 from './camcp2-test4.json';
import camcp2ListeningTopicBank from './camcp2-listening-topic-bank.json';

// Book 3
import camcp3Test1 from './camcp3-test1.json';
import camcp3Test2 from './camcp3-test2.json';
import camcp3Test3 from './camcp3-test3.json';
import camcp3Test4 from './camcp3-test4.json';
import camcp3ListeningTopicBank from './camcp3-listening-topic-bank.json';

// Book 4
import camcp4Test1 from './camcp4-test1.json';
import camcp4Test2 from './camcp4-test2.json';
import camcp4Test3 from './camcp4-test3.json';
import camcp4Test4 from './camcp4-test4.json';
import camcp4ListeningTopicBank from './camcp4-listening-topic-bank.json';

// Book 5
import camcp5Test1 from './camcp5-test1.json';
import camcp5Test2 from './camcp5-test2.json';
import camcp5Test3 from './camcp5-test3.json';
import camcp5Test4 from './camcp5-test4.json';
import camcp5ListeningTopicBank from './camcp5-listening-topic-bank.json';


// Import the 10 CPE Entry Tests
import cpeEntryTest1 from './cpe-entry-test1.json';
import cpeEntryTest2 from './cpe-entry-test2.json';
import cpeEntryTest3 from './cpe-entry-test3.json';
import cpeEntryTest4 from './cpe-entry-test4.json';
import cpeEntryTest5 from './cpe-entry-test5.json';
import cpeEntryTest6 from './cpe-entry-test6.json';
import cpeEntryTest7 from './cpe-entry-test7.json';
import cpeEntryTest8 from './cpe-entry-test8.json';
import cpeEntryTest9 from './cpe-entry-test9.json';
import cpeEntryTest10 from './cpe-entry-test10.json';

// Import CAE/C1 Advanced tests and topic banks
import caeErrorCorrectionBank from './cae-error-correction-bank.json';
import caeOfficialPracticeTest1 from './cae-official-practice-test1.json';
import camCaePlus1Test1 from './cam-cae-plus1-test1.json';
import camCaePlus1Test2 from './cam-cae-plus1-test2.json';
import camCaePlus1Test3 from './cam-cae-plus1-test3.json';
import camCaePlus1Test4 from './cam-cae-plus1-test4.json';
import camCaePlus1Test5 from './cam-cae-plus1-test5.json';
import camCae1ListeningTopicBank from './cam-cae1-listening-topic-bank.json';
import camCae1Test1 from './cam-cae1-test1.json';
import camCae1Test2 from './cam-cae1-test2.json';
import camCae1Test3 from './cam-cae1-test3.json';
import camCae1Test4 from './cam-cae1-test4.json';
import camCae2ListeningTopicBank from './cam-cae2-listening-topic-bank.json';
import camCae2Test1 from './cam-cae2-test1.json';
import camCae2Test2 from './cam-cae2-test2.json';
import camCae2Test3 from './cam-cae2-test3.json';
import camCae2Test4 from './cam-cae2-test4.json';
import camCae3ListeningTopicBank from './cam-cae3-listening-topic-bank.json';
import camCae3Test1 from './cam-cae3-test1.json';
import camCae3Test2 from './cam-cae3-test2.json';
import camCae3Test3 from './cam-cae3-test3.json';
import camCae3Test4 from './cam-cae3-test4.json';
import camCae4ListeningTopicBank from './cam-cae4-listening-topic-bank.json';
import camCae4Test1 from './cam-cae4-test1.json';
import camCae4Test2 from './cam-cae4-test2.json';
import camCae4Test3 from './cam-cae4-test3.json';
import camCae4Test4 from './cam-cae4-test4.json';
import camCae5Test1 from './cam-cae5-test1.json';
import camCae5Test2 from './cam-cae5-test2.json';
import camCae5Test3 from './cam-cae5-test3.json';
import camCae5Test4 from './cam-cae5-test4.json';
import camCae6ListeningTopicBank from './cam-cae6-listening-topic-bank.json';
import camCae6Test1 from './cam-cae6-test1.json';
import camCae6Test2 from './cam-cae6-test2.json';
import camCae6Test3 from './cam-cae6-test3.json';
import camCae6Test4 from './cam-cae6-test4.json';

// 1. Export IELTS Mock Tests with exam track flag
export const SAMPLE_READING_TEST = { ...(readingSample1 as any), exam: 'ielts' } as unknown as IeltsTest;
export const SAMPLE_READING_TEST_2 = { ...(readingSample2 as any), exam: 'ielts' } as unknown as IeltsTest;
export const SAMPLE_READING_TEST_3 = { ...(readingSample3 as any), exam: 'ielts' } as unknown as IeltsTest;
export const SAMPLE_LISTENING_TEST = { ...(listeningSample1 as any), exam: 'ielts' } as unknown as IeltsTest;
export const SAMPLE_LISTENING_TEST_2 = { ...(listeningSample2 as any), exam: 'ielts' } as unknown as IeltsTest;
export const SAMPLE_LISTENING_TEST_3 = { ...(listeningSample3 as any), exam: 'ielts' } as unknown as IeltsTest;
export const GOLDEN_DATASET = goldenDataset;

// 2. Export CPE Mock Tests with exam track flag
export const SAMPLE_CPE_TEST = { ...(cpeSample1 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_PRACTICE_TEST_1_BOOK_3 = { ...(cpePracticeTest1Book3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_PRACTICE_TEST_2_BOOK_3 = { ...(cpePracticeTest2Book3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_PRACTICE_TEST_3_BOOK_3 = { ...(cpePracticeTest3Book3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_PRACTICE_TEST_4_BOOK_3 = { ...(cpePracticeTest4Book3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_PRACTICE_TEST_5_BOOK_3 = { ...(cpePracticeTest5Book3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_PRACTICE_TEST_6_BOOK_3 = { ...(cpePracticeTest6Book3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE2_TEST_1 = { ...(cpe2Test1 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE2_TEST_2 = { ...(cpe2Test2 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE2_TEST_3 = { ...(cpe2Test3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE2_TEST_4 = { ...(cpe2Test4 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE2_TEST_5 = { ...(cpe2Test5 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE2_TEST_6 = { ...(cpe2Test6 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAM_CPE1_TEST1 = { ...(camCpe1Test1 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAM_CPE1_TEST2 = { ...(camCpe1Test2 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAM_CPE1_TEST3 = { ...(camCpe1Test3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAM_CPE1_TEST4 = { ...(camCpe1Test4 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP2_TEST1 = { ...(camcp2Test1 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP2_TEST2 = { ...(camcp2Test2 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP2_TEST3 = { ...(camcp2Test3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP2_TEST4 = { ...(camcp2Test4 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP2_LISTENING_TOPIC_BANK = { ...(camcp2ListeningTopicBank as any), exam: 'cpe' } as unknown as IeltsTest;

// Book 3
export const CAMCP3_TEST1 = { ...(camcp3Test1 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP3_TEST2 = { ...(camcp3Test2 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP3_TEST3 = { ...(camcp3Test3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP3_TEST4 = { ...(camcp3Test4 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP3_LISTENING_TOPIC_BANK = { ...(camcp3ListeningTopicBank as any), exam: 'cpe' } as unknown as IeltsTest;

// Book 4
export const CAMCP4_TEST1 = { ...(camcp4Test1 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP4_TEST2 = { ...(camcp4Test2 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP4_TEST3 = { ...(camcp4Test3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP4_TEST4 = { ...(camcp4Test4 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP4_LISTENING_TOPIC_BANK = { ...(camcp4ListeningTopicBank as any), exam: 'cpe' } as unknown as IeltsTest;

// Book 5
export const CAMCP5_TEST1 = { ...(camcp5Test1 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP5_TEST2 = { ...(camcp5Test2 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP5_TEST3 = { ...(camcp5Test3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP5_TEST4 = { ...(camcp5Test4 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CAMCP5_LISTENING_TOPIC_BANK = { ...(camcp5ListeningTopicBank as any), exam: 'cpe' } as unknown as IeltsTest;


// Export the 10 CPE Entry Tests
export const CPE_ENTRY_TEST_1 = { ...(cpeEntryTest1 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_ENTRY_TEST_2 = { ...(cpeEntryTest2 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_ENTRY_TEST_3 = { ...(cpeEntryTest3 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_ENTRY_TEST_4 = { ...(cpeEntryTest4 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_ENTRY_TEST_5 = { ...(cpeEntryTest5 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_ENTRY_TEST_6 = { ...(cpeEntryTest6 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_ENTRY_TEST_7 = { ...(cpeEntryTest7 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_ENTRY_TEST_8 = { ...(cpeEntryTest8 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_ENTRY_TEST_9 = { ...(cpeEntryTest9 as any), exam: 'cpe' } as unknown as IeltsTest;
export const CPE_ENTRY_TEST_10 = { ...(cpeEntryTest10 as any), exam: 'cpe' } as unknown as IeltsTest;

// 3. Export CAE/C1 Advanced tests with exam track flag
export const CAE_ERROR_CORRECTION_BANK = { ...(caeErrorCorrectionBank as any), exam: 'cae' } as unknown as IeltsTest;
export const CAE_OFFICIAL_PRACTICE_TEST1 = { ...(caeOfficialPracticeTest1 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE_PLUS1_TEST1 = { ...(camCaePlus1Test1 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE_PLUS1_TEST2 = { ...(camCaePlus1Test2 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE_PLUS1_TEST3 = { ...(camCaePlus1Test3 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE_PLUS1_TEST4 = { ...(camCaePlus1Test4 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE_PLUS1_TEST5 = { ...(camCaePlus1Test5 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE1_LISTENING_TOPIC_BANK = { ...(camCae1ListeningTopicBank as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE1_TEST1 = { ...(camCae1Test1 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE1_TEST2 = { ...(camCae1Test2 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE1_TEST3 = { ...(camCae1Test3 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE1_TEST4 = { ...(camCae1Test4 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE2_LISTENING_TOPIC_BANK = { ...(camCae2ListeningTopicBank as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE2_TEST1 = { ...(camCae2Test1 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE2_TEST2 = { ...(camCae2Test2 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE2_TEST3 = { ...(camCae2Test3 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE2_TEST4 = { ...(camCae2Test4 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE3_LISTENING_TOPIC_BANK = { ...(camCae3ListeningTopicBank as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE3_TEST1 = { ...(camCae3Test1 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE3_TEST2 = { ...(camCae3Test2 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE3_TEST3 = { ...(camCae3Test3 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE3_TEST4 = { ...(camCae3Test4 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE4_LISTENING_TOPIC_BANK = { ...(camCae4ListeningTopicBank as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE4_TEST1 = { ...(camCae4Test1 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE4_TEST2 = { ...(camCae4Test2 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE4_TEST3 = { ...(camCae4Test3 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE4_TEST4 = { ...(camCae4Test4 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE5_TEST1 = { ...(camCae5Test1 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE5_TEST2 = { ...(camCae5Test2 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE5_TEST3 = { ...(camCae5Test3 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE5_TEST4 = { ...(camCae5Test4 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE6_LISTENING_TOPIC_BANK = { ...(camCae6ListeningTopicBank as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE6_TEST1 = { ...(camCae6Test1 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE6_TEST2 = { ...(camCae6Test2 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE6_TEST3 = { ...(camCae6Test3 as any), exam: 'cae' } as unknown as IeltsTest;
export const CAM_CAE6_TEST4 = { ...(camCae6Test4 as any), exam: 'cae' } as unknown as IeltsTest;

// Backward-compatible aliases used by the legacy IELTS desktop seed list.
export const SAMPLE_CAE_TEST = CAE_OFFICIAL_PRACTICE_TEST1;
export const CAE_ENTRY_TEST_1 = CAM_CAE1_TEST1;
export const CAE_ENTRY_TEST_2 = CAM_CAE1_TEST2;
export const CAE_ENTRY_TEST_3 = CAM_CAE1_TEST3;

export * from './cpe-writing-speaking-samples';
export * from './ielts-writing-speaking-samples';
