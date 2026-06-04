import type { EnglishExamQuestion, EnglishExamSection, EnglishExamTest } from '../standard';

type CAEVisualAsset = {
  src: string;
  alt: string;
  caption: string;
};

type CAEWritingTask = {
  id: string;
  test: number;
  part: 1 | 2;
  taskNumber: number;
  title: string;
  prompt: string;
  genre: string;
  wordCount: string;
  source: string;
  guidance?: string[];
  visuals?: CAEVisualAsset[];
};

type CAESpeakingTask = {
  id: string;
  test: number;
  part: 1 | 2 | 3 | 4;
  title: string;
  prompt: string;
  focus: string[];
  source: string;
  guidance?: string[];
};

const writingTopic = (part: 1 | 2) => ({
  id: `cae_writing_part_${part}`,
  title: `CAE Writing Part ${part}`,
  skill: 'writing',
  program: 'cae',
});

const speakingTopic = (part: 1 | 2 | 3 | 4) => ({
  id: `cae_speaking_part_${part}`,
  title: `CAE Speaking Part ${part}`,
  skill: 'speaking',
  program: 'cae',
});

const feedbackAnswer = [['feedback_only']];

const visualInputHtml = (visuals: CAEVisualAsset[] = []) => {
  if (!visuals.length) return null;
  const figures = visuals
    .map(
      (visual) => `
        <figure class="my-3 rounded-md border border-slate-200 bg-white p-2">
          <img src="${visual.src}" alt="${visual.alt}" class="w-full rounded border border-slate-100" loading="lazy" />
          <figcaption class="mt-2 text-xs text-slate-500">${visual.caption}</figcaption>
        </figure>`,
    )
    .join('');
  return `<div class="space-y-3 text-sm text-slate-700"><p class="font-semibold text-slate-800">Original visual input</p>${figures}</div>`;
};

const writingExplanation = (genre: string, guidance: string[] = []) =>
  [
    `Feedback-only CAE ${genre} task.`,
    'Assess against Cambridge C1 criteria: content coverage, communicative achievement, organisation, language range and accuracy.',
    'During review, identify the task requirements, expected register, paragraph plan, useful language, likely traps, and one concrete rewrite target.',
    guidance.length ? `Suggested response guide: ${guidance.join(' ')}` : '',
  ].join(' ');

const speakingExplanation = (part: number, guidance: string[] = []) =>
  [
    `Feedback-only CAE Speaking Part ${part} task.`,
    'Assess against Cambridge C1 criteria: grammar and vocabulary, discourse management, pronunciation, and interactive communication.',
    'During review, capture missing ideas, weak linking, unclear comparison or justification, pronunciation blockers, and one repeatable speaking drill.',
    guidance.length ? `Suggested response guide: ${guidance.join(' ')}` : '',
  ].join(' ');

const createWritingQuestion = (task: CAEWritingTask): EnglishExamQuestion => ({
  id: task.id,
  type: 'writing_task',
  instruction: task.prompt,
  correctAnswer: null,
  acceptedAnswers: feedbackAnswer,
  explanation: writingExplanation(task.genre, task.guidance),
  answerLocation: task.source,
  passageHtml: visualInputHtml(task.visuals),
  displayMode: 'both',
  category: `cae_writing_part_${task.part}`,
  topic: writingTopic(task.part),
});

const createSpeakingQuestion = (task: CAESpeakingTask): EnglishExamQuestion => ({
  id: task.id,
  type: 'speaking_task',
  instruction: task.prompt,
  correctAnswer: null,
  acceptedAnswers: feedbackAnswer,
  explanation: speakingExplanation(task.part, task.guidance),
  answerLocation: task.source,
  displayMode: 'both',
  category: `cae_speaking_part_${task.part}`,
  topic: speakingTopic(task.part),
});

export const CAE4_WRITING_TASKS: CAEWritingTask[] = [
  {
    id: 'q-cam-cae4-w-t1-p1',
    test: 1,
    part: 1,
    taskNumber: 1,
    title: 'Lost backpack letters',
    genre: 'Formal and Semi-formal Letters',
    wordCount: 'about 200 words plus about 50 words',
    source: 'Cambridge CAE 4, Test 1, Paper 2 Writing, Part 1',
    visuals: [
      {
        src: '/assets/cae/visual-inputs/cae4-writing-test1-input-1.png',
        alt: 'CAE 4 Test 1 Writing Part 1 missing articles statement',
        caption: 'CAE 4 Test 1 Writing Part 1 source page: missing articles statement.',
      },
      {
        src: '/assets/cae/visual-inputs/cae4-writing-test1-input-2.png',
        alt: 'CAE 4 Test 1 Writing Part 1 finder note and task instructions',
        caption: 'CAE 4 Test 1 Writing Part 1 source page: finder note and two-letter task.',
      },
    ],
    guidance: [
      'Write both letters: one to the newspaper editor and one brief letter to the police.',
      'Cover the missing backpack, the returned contents, the missing passport, thanks to the finder, and the offer to repay postage.',
      'Trap: do not include postal addresses and do not ignore the police reference details.',
    ],
    prompt:
      'Write two letters about a lost backpack in New Zealand. You lost a large green backpack at Auckland bus station and reported it to the police. Later, back home, you received the backpack with all contents except your passport, plus an unsigned note from the finder saying it had been found under a bush near the beach in Auckland and posted back using the address book. Contents included a 35mm camera with used film, a passport number O-H-65839, a red leather address book, a 1999 diary, clothing and toiletries. Write (a) a letter to the Editor of the Auckland News describing what happened, thanking the person who found the backpack, and offering to repay postage, and (b) a brief letter to New Zealand police giving relevant information about the returned backpack. Do not include addresses.',
  },
  {
    id: 'q-cam-cae4-w-t1-p2-2',
    test: 1,
    part: 2,
    taskNumber: 2,
    title: 'English book review',
    genre: 'Review',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 1, Paper 2 Writing, Part 2',
    guidance: ['Summarise the book briefly, explain why others may enjoy it, and state what readers can learn.', 'Trap: avoid retelling the whole plot.'],
    prompt:
      'Write a short review for your English club magazine about a book you have enjoyed reading in English. The book can be of any type. Include a brief summary, say why others might enjoy it, and explain what they might learn from it.',
  },
  {
    id: 'q-cam-cae4-w-t1-p2-3',
    test: 1,
    part: 2,
    taskNumber: 3,
    title: 'Young people challenge article',
    genre: 'Article',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 1, Paper 2 Writing, Part 2',
    guidance: ['Identify one clear challenge, raise readers interest, and develop why it matters at the start of the twenty-first century.', 'Trap: do not list many vague problems.'],
    prompt:
      'Write an article for PROJECT 2000, an international magazine about important world developments. Draw readers attention to the main challenge faced by young people in your country at the start of the twenty-first century and make the issue interesting to an international audience.',
  },
  {
    id: 'q-cam-cae4-w-t1-p2-4',
    test: 1,
    part: 2,
    taskNumber: 4,
    title: 'Tourist video proposal',
    genre: 'Proposal',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 1, Paper 2 Writing, Part 2',
    guidance: ['Recommend places, interviewees, and the character of the town the video should convey.', 'Trap: keep the proposal practical for a 30-minute tourist video.'],
    prompt:
      'Write a proposal for a British film company that wants to make a 30-minute tourist video about your town. State what places the video should show and why, who should be interviewed and why, and what is special about the character of your town that the video should convey.',
  },
  {
    id: 'q-cam-cae4-w-t1-p2-5',
    test: 1,
    part: 2,
    taskNumber: 5,
    title: 'Branch location report',
    genre: 'Report',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 1, Paper 2 Writing, Part 2',
    guidance: ['Name the location and justify it with geography, recruitment, communications and other business factors.', 'Trap: a recommendation must be explicit.'],
    prompt:
      'Write a report for your company or organisation recommending a country or location for setting up a branch or office. Name the location and explain why it would be suitable, referring to geographical position, potential for recruiting staff, communications and any other important features.',
  },
  {
    id: 'q-cam-cae4-w-t2-p1',
    test: 2,
    part: 1,
    taskNumber: 1,
    title: 'Work placement application letters',
    genre: 'Application and Personal Letter',
    wordCount: 'about 150 words plus about 100 words',
    source: 'Cambridge CAE 4, Test 2, Paper 2 Writing, Part 1',
    visuals: [
      {
        src: '/assets/cae/visual-inputs/cae4-writing-test2-input-1.png',
        alt: 'CAE 4 Test 2 Writing Part 1 work placements advertisement',
        caption: 'CAE 4 Test 2 Writing Part 1 source page: WPA advertisement with notes.',
      },
      {
        src: '/assets/cae/visual-inputs/cae4-writing-test2-input-2.png',
        alt: 'CAE 4 Test 2 Writing Part 1 Sheila letter and task instructions',
        caption: 'CAE 4 Test 2 Writing Part 1 source page: Sheila letter and two-letter task.',
      },
    ],
    guidance: [
      'Write both letters: an application to WPA and a personal letter to Sheila.',
      'Mention the placement type, availability, experience, level of English, computer skills, Zimbabwe connection and career benefit.',
      'Trap: keep the WPA letter formal and the Sheila letter friendly.',
    ],
    prompt:
      'Write two letters about applying for a one-month work placement abroad through Work Placements Abroad Ltd. WPA arranges short-term work placements in international organisations in English-speaking countries and pays an allowance covering living and accommodation expenses, but you must arrange somewhere to stay. Your friend Sheila in Zimbabwe advises you to apply to Zimbabwe, mention your English level, computer skills and connections with Zimbabwe, and explain how the experience would help your career. Write (a) a letter to WPA applying for a work placement and (b) a letter to Sheila telling her what you have done and asking for her advice. Do not include addresses.',
  },
  {
    id: 'q-cam-cae4-w-t2-p2-2',
    test: 2,
    part: 2,
    taskNumber: 2,
    title: 'Childhood celebrations article',
    genre: 'Article',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 2, Paper 2 Writing, Part 2',
    guidance: ['Describe childhood family celebrations and compare them with celebrations for children today.', 'Trap: do not write only nostalgia; explain change clearly.'],
    prompt:
      'Write an article for Society Worldwide for a series called Childhood - Past and Present. Share memories of family celebrations from your childhood, describe examples, and explain clearly how such celebrations may be different for children today.',
  },
  {
    id: 'q-cam-cae4-w-t2-p2-3',
    test: 2,
    part: 2,
    taskNumber: 3,
    title: 'Undiscovered countryside brochure',
    genre: 'Brochure Contribution',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 2, Paper 2 Writing, Part 2',
    guidance: ['Include activities, accommodation and likely weather conditions for a countryside holiday.', 'Trap: write promotional but useful information, not a general essay.'],
    prompt:
      'Write a contribution to a Tourist Board brochure called The Undiscovered Countryside. Encourage tourists to spend holidays in the countryside by including what can be done there, what kinds of accommodation are available, and what weather conditions are likely.',
  },
  {
    id: 'q-cam-cae4-w-t2-p2-4',
    test: 2,
    part: 2,
    taskNumber: 4,
    title: 'TV and under-18s report',
    genre: 'Report',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 2, Paper 2 Writing, Part 2',
    guidance: ['Report findings from interviews with fifty people and answer both survey questions.', 'Trap: distinguish evidence from personal opinion.'],
    prompt:
      'Write a report for MRM TV Research after interviewing fifty people of various ages in your area about television and young people. Address whether today young people are watching too much TV and what good or bad influences TV has on the young.',
  },
  {
    id: 'q-cam-cae4-w-t2-p2-5',
    test: 2,
    part: 2,
    taskNumber: 5,
    title: 'Residential training memo',
    genre: 'Memo',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 2, Paper 2 Writing, Part 2',
    guidance: ['Summarise your own and colleagues reactions to the course, accommodation and facilities.', 'Trap: a memo needs concise workplace organisation.'],
    prompt:
      'Write a memorandum to a senior colleague who missed a two-week residential training course because of illness. You are in the middle of the course, and the course, accommodation and other facilities have caused both positive and negative reactions from your colleagues. Summarise your reactions and those of your colleagues.',
  },
  {
    id: 'q-cam-cae4-w-t3-p1',
    test: 3,
    part: 1,
    taskNumber: 1,
    title: 'KPD School correction letters',
    genre: 'Complaint Letter and Support Note',
    wordCount: 'approximately 250 words total',
    source: 'Cambridge CAE 4, Test 3, Paper 2 Writing, Part 1; teacher mark scheme used because the scanned student page omits page 66',
    guidance: [
      'Write both a formal complaint to the newspaper and a brief note to Mrs Driver.',
      'Correct the inaccurate claims: teachers are not lazy, students do pass exams, excursions happen once a month with group rates, and food is inexpensive and good quality.',
      'Trap: the scanned student PDF omits the original newspaper cutting page, so this task is reconstructed from the teacher mark scheme and should be reviewed against the source if a complete scan is later added.',
    ],
    prompt:
      'Write a formal letter to the newspaper and a brief note to Mrs Driver about an inaccurate article concerning KPD School, where you previously attended an English course. Andrea, a teacher, says the article contained many mistakes and that Mrs Driver is worried students may stop coming. In your newspaper letter, explain who you are, refer to the original article dated 11 September, correct the inaccuracies, and express a positive view of KPD. The corrections to include are: teachers are not lazy, students do pass exams, excursions are organised once a month with group rates, and the food is inexpensive and of good quality. You may ask for a correction or apology. Then write a short supportive note to Mrs Driver saying what action you have taken.',
  },
  {
    id: 'q-cam-cae4-w-t3-p2-2',
    test: 3,
    part: 2,
    taskNumber: 2,
    title: 'Magazine choices report',
    genre: 'Report',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 3, Paper 2 Writing, Part 2',
    guidance: ['Choose real English-language magazines, state first and second choices, and explain benefits for students.', 'Trap: books, newspapers and invented magazines do not fit the task.'],
    prompt:
      'Write a report for a college competition asking for a better range of good magazines for the library. Recommend your first and second choices of real English-language magazines and explain why each would benefit students.',
  },
  {
    id: 'q-cam-cae4-w-t3-p2-3',
    test: 3,
    part: 2,
    taskNumber: 3,
    title: 'Videos review',
    genre: 'Review',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 3, Paper 2 Writing, Part 2',
    guidance: ['Review three currently available videos of different types and explain why varied international colleagues might or might not watch them.', 'Trap: cover exactly the audience relevance, not only plot summaries.'],
    prompt:
      'Write a review for your college or workplace magazine feature about videos. Select three currently available videos of different types, such as cinema film, pop or rock, educational, tourist, or sports event videos. Indicate why colleagues of varied nationalities might or might not want to watch them.',
  },
  {
    id: 'q-cam-cae4-w-t3-p2-4',
    test: 3,
    part: 2,
    taskNumber: 4,
    title: 'Education opportunities directory entry',
    genre: 'Directory Entry',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 3, Paper 2 Writing, Part 2',
    guidance: ['Describe educational opportunities in your country for students aged 16 and over, especially for students from abroad.', 'Trap: do not merely describe the whole school system.'],
    prompt:
      'Write the entry about different types of educational opportunities in your country for the SIMON International Student Directory. The directory helps students wishing to study abroad and contains information about educational systems throughout the world. Focus on opportunities for students from the age of 16 upwards.',
  },
  {
    id: 'q-cam-cae4-w-t3-p2-5',
    test: 3,
    part: 2,
    taskNumber: 5,
    title: 'Job challenges article',
    genre: 'Article',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 3, Paper 2 Writing, Part 2',
    guidance: ['Name or clearly specify the job, describe the tasks and challenges, and define the person best suited to it.', 'Trap: do not spend space explaining why you are leaving.'],
    prompt:
      'Write an article for the in-house magazine as you are leaving your job in a multi-national company. Write about the job itself, the challenges of the job and the sort of person best suited to meet those challenges.',
  },
  {
    id: 'q-cam-cae4-w-t4-p1',
    test: 4,
    part: 1,
    taskNumber: 1,
    title: 'International club improvement letter',
    genre: 'Letter',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 4, Paper 2 Writing, Part 1',
    visuals: [
      {
        src: '/assets/cae/visual-inputs/cae4-writing-test4-input-1.png',
        alt: 'CAE 4 Test 4 Writing Part 1 International Circle programme',
        caption: 'CAE 4 Test 4 Writing Part 1 source page: club programme.',
      },
      {
        src: '/assets/cae/visual-inputs/cae4-writing-test4-input-2.png',
        alt: 'CAE 4 Test 4 Writing Part 1 members suggestions and task instructions',
        caption: 'CAE 4 Test 4 Writing Part 1 source page: problems, suggestions and letter task.',
      },
    ],
    guidance: ['Explain why changes are needed, suggest two or three different activities, and justify why they would work.', 'Trap: avoid simply repeating the old programme; respond to members concerns.'],
    prompt:
      'Write a letter to Ms Jane Dennis, chairperson of an international friendship club, explaining why members feel changes would be a good idea. The club has a friendly atmosphere but meetings are dull, membership is falling, the average committee age is over 40, younger members want livelier meetings, the clubroom is small and depressing, and publicity is boring. Suggest two or three rather different future activities such as a disco, barbecue, quiz night, karaoke, fancy-dress party, theatre trip, treasure hunt, concert or sports tournament, and explain why they would be successful. Do not include addresses.',
  },
  {
    id: 'q-cam-cae4-w-t4-p2-2',
    test: 4,
    part: 2,
    taskNumber: 2,
    title: 'Strike reassurance letter',
    genre: 'Letter',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 4, Paper 2 Writing, Part 2',
    guidance: ['Reassure the friend, describe what actually happened, and explain how people are coping.', 'Trap: keep tone personal and calming, not a news report.'],
    prompt:
      'Write a letter to a friend abroad who is concerned after hearing exaggerated TV reports about a strike in your country affecting everyday life such as transport, power, medical services or rubbish collection. Reassure your friend by describing what has happened and how people are coping.',
  },
  {
    id: 'q-cam-cae4-w-t4-p2-3',
    test: 4,
    part: 2,
    taskNumber: 3,
    title: 'Visitor facilities article',
    genre: 'Article',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 4, Paper 2 Writing, Part 2',
    guidance: ['Describe recent improvements in visitor facilities in your country and make the article informative enough for an international magazine competition.', 'Trap: link improvements to visitor experience.'],
    prompt:
      'Write an article for an international magazine competition about recent improvements in facilities for visitors to your country. The magazine will publish the most informative articles and later award a free trip to the best author.',
  },
  {
    id: 'q-cam-cae4-w-t4-p2-4',
    test: 4,
    part: 2,
    taskNumber: 4,
    title: 'Satellite TV series review',
    genre: 'Review',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 4, Paper 2 Writing, Part 2',
    guidance: ['Review the series and encourage colleagues to watch it regularly, including the quality of English used.', 'Trap: include reasons beyond personal taste.'],
    prompt:
      'Write a review for your workplace or college newsletter of a new satellite TV series being shown in your country. It seems worth watching for several reasons, including the quality of the English language used. Encourage colleagues to watch regularly.',
  },
  {
    id: 'q-cam-cae4-w-t4-p2-5',
    test: 4,
    part: 2,
    taskNumber: 5,
    title: 'School-leavers employment report',
    genre: 'Report',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 4, Test 4, Paper 2 Writing, Part 2',
    guidance: ['Focus on school-leavers in your local area, covering employment types, pay and conditions, and training possibilities.', 'Trap: keep the title and research purpose visible.'],
    prompt:
      'Write a report for an international organisation researching employment prospects in different parts of the world. The report is entitled Opportunities for School-leavers and should focus on your local area, including kinds of employment available for young people, pay and conditions, and training possibilities.',
  },
];

export const CAE5_WRITING_TASKS: CAEWritingTask[] = [
  {
    id: 'q-cam-cae5-w-t1-p1',
    test: 1,
    part: 1,
    taskNumber: 1,
    title: 'Language Institute canteen report',
    genre: 'Report',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 1, Paper 2 Writing, Part 1',
    visuals: [
      {
        src: '/assets/cae/visual-inputs/cae5-writing-test1-input-1.png',
        alt: 'CAE 5 Test 1 Writing Part 1 student complaints and Kavanagh proposal',
        caption: 'CAE 5 Test 1 Writing Part 1 source page: complaints and first catering proposal.',
      },
      {
        src: '/assets/cae/visual-inputs/cae5-writing-test1-input-2.png',
        alt: 'CAE 5 Test 1 Writing Part 1 Rainbow and Xanadu proposals',
        caption: 'CAE 5 Test 1 Writing Part 1 source page: shortlisted catering proposals.',
      },
    ],
    guidance: ['Assess all three catering proposals, weigh advantages and disadvantages, and recommend one to the Principal.', 'Trap: address the original complaints: health, choice, price, staff and opening hours.'],
    prompt:
      'Write a report for the Principal of the Language Institute about improving the college canteen after student complaints about unhealthy food, little choice, high prices, unfriendly staff and limited opening hours. Assess the advantages and disadvantages of three shortlisted catering proposals: Kavanagh Catering Services with basic low-cost food and 8am-8pm opening, Rainbow Ltd with healthy fresh food, salads, vegetarian options and 9am-6pm opening, and Xanadu Express with world cuisine, full meals, wide drinks range and 8am-10pm opening. Recommend one proposal and justify your choice.',
  },
  {
    id: 'q-cam-cae5-w-t1-p2-2',
    test: 1,
    part: 2,
    taskNumber: 2,
    title: 'New technology article',
    genre: 'Article',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 1, Paper 2 Writing, Part 2',
    guidance: ['Outline the impact of new technology on your life now and predict near-future changes.', 'Trap: make it personal enough for a magazine article, not just a technology essay.'],
    prompt:
      'Write an article for Modern World magazine on new technology and how it affects your life. Outline the impact of new technology on your life now, explain further changes likely in the near future, and say how these could affect you.',
  },
  {
    id: 'q-cam-cae5-w-t1-p2-3',
    test: 1,
    part: 2,
    taskNumber: 3,
    title: 'English-speaking country competition entry',
    genre: 'Competition Entry',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 1, Paper 2 Writing, Part 2',
    guidance: ['Give a clear opinion on whether working and travelling in an English-speaking country is the best way to learn English.', 'Trap: balance reasons instead of only agreeing strongly.'],
    prompt:
      'Write a competition entry responding to the opinion: If you really want to learn English you should get a job in an English-speaking country, speak to the people and travel around. Give your reasons why you agree or disagree. The best answer wins a ticket to London.',
  },
  {
    id: 'q-cam-cae5-w-t1-p2-4',
    test: 1,
    part: 2,
    taskNumber: 4,
    title: 'Memorable event account',
    genre: 'Account',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 1, Paper 2 Writing, Part 2',
    guidance: ['Explain why the event took place, what happened, and the effect it had on you.', 'Trap: narrative detail should support significance.'],
    prompt:
      'Write an account for an in-flight magazine about a special local or national event you recently attended that was particularly memorable. Explain why it took place, what happened, and most importantly the effect it had on you.',
  },
  {
    id: 'q-cam-cae5-w-t1-p2-5',
    test: 1,
    part: 2,
    taskNumber: 5,
    title: 'Work-related book review',
    genre: 'Review',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 1, Paper 2 Writing, Part 2',
    guidance: ['Name the book, summarise contents, explain what you learned and how it may help others at work.', 'Trap: make the work relevance explicit.'],
    prompt:
      'Write a review for an international business magazine naming a book which has helped you in your job. Include the name of the book, a brief summary of the contents, what you personally learned from it, and how it may help other people in their work.',
  },
  {
    id: 'q-cam-cae5-w-t2-p1',
    test: 2,
    part: 1,
    taskNumber: 1,
    title: 'College Open Day newspaper letter',
    genre: 'Letter',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 2, Paper 2 Writing, Part 1',
    visuals: [
      {
        src: '/assets/cae/visual-inputs/cae5-writing-test2-input-1.png',
        alt: 'CAE 5 Test 2 Writing Part 1 local newspaper article',
        caption: 'CAE 5 Test 2 Writing Part 1 source page: local newspaper article with notes.',
      },
      {
        src: '/assets/cae/visual-inputs/cae5-writing-test2-input-2.png',
        alt: 'CAE 5 Test 2 Writing Part 1 principal memo',
        caption: 'CAE 5 Test 2 Writing Part 1 source page: Principal memo and Open Day details.',
      },
    ],
    guidance: ['Apologise briefly to residents, correct inaccurate claims, and publicise the Open Day programme.', 'Trap: keep the letter suitable for newspaper publication.'],
    prompt:
      'Write a letter to the editor of a local newspaper after an article criticised students at Whitecross College. As social organiser, respond to complaints about noise, exam results, students blocking pavements and dropping litter, and lack of social programme. Apologise briefly to local residents, correct the inaccurate claims, and encourage people to come to the College Open Day on Saturday 11 October from 10.30am to 10.30pm. Include details such as an international barbecue, college concert, Sports Challenge against local teams, chance to try the computer centre and language laboratory, and displays of college activities. Do not include postal addresses.',
  },
  {
    id: 'q-cam-cae5-w-t2-p2-2',
    test: 2,
    part: 2,
    taskNumber: 2,
    title: 'Student English magazine proposal',
    genre: 'Proposal',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 2, Paper 2 Writing, Part 2',
    guidance: ['Explain the purpose of the magazine, content of the first issue and support needed from the college.', 'Trap: a proposal needs clear headings and practical requests.'],
    prompt:
      'Write a proposal to the Principal asking for permission and financial support to start a monthly magazine in English for students at your college. Include why you want to start the magazine, what the first issue would include, and what support and financial help you need from the college.',
  },
  {
    id: 'q-cam-cae5-w-t2-p2-3',
    test: 2,
    part: 2,
    taskNumber: 3,
    title: 'Travel companions competition entry',
    genre: 'Competition Entry',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 2, Paper 2 Writing, Part 2',
    guidance: ['Compare travelling alone, with friends and with family, covering benefits and disadvantages.', 'Trap: do not choose one option without discussing the others.'],
    prompt:
      'Write a competition entry for a youth hostel magazine answering: Should we travel alone, with friends or with family? Discuss the benefits of each and any disadvantages. The winner receives a mountain bike.',
  },
  {
    id: 'q-cam-cae5-w-t2-p2-4',
    test: 2,
    part: 2,
    taskNumber: 4,
    title: 'Energy and natural resources report',
    genre: 'Report',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 2, Paper 2 Writing, Part 2',
    guidance: ['Report what is being done locally, how successful the measures are, and what more could be done.', 'Trap: answer all three questions directly.'],
    prompt:
      'Write a report for the English magazine column It will Cost The Earth as part of an investigation into environmental issues. Address what is being done to cut down on energy and natural resource use in your village, town or city, how successful these measures are, and what more could be done.',
  },
  {
    id: 'q-cam-cae5-w-t2-p2-5',
    test: 2,
    part: 2,
    taskNumber: 5,
    title: 'Marketing job character reference',
    genre: 'Character Reference',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 2, Paper 2 Writing, Part 2',
    guidance: ['State how long and in what capacity you have worked with the applicant, then cover business skills, experience and personal qualities.', 'Trap: maintain a professional reference tone.'],
    prompt:
      'Write a character reference for someone in your department who has applied for a job in the marketing department of a multinational company. Indicate how long and in what capacity you have worked with this person, comment on business skills and experience, and mention relevant personal qualities for a marketing position.',
  },
  {
    id: 'q-cam-cae5-w-t3-p1',
    test: 3,
    part: 1,
    taskNumber: 1,
    title: 'Sports Centre plans letter',
    genre: 'Letter',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 3, Paper 2 Writing, Part 1',
    visuals: [
      {
        src: '/assets/cae/visual-inputs/cae5-writing-test3-input-1.png',
        alt: 'CAE 5 Test 3 Writing Part 1 sports centre memo and current plan',
        caption: 'CAE 5 Test 3 Writing Part 1 source page: Principal memo and current sports centre plan.',
      },
      {
        src: '/assets/cae/visual-inputs/cae5-writing-test3-input-2.png',
        alt: 'CAE 5 Test 3 Writing Part 1 proposed sports centre plan',
        caption: 'CAE 5 Test 3 Writing Part 1 source page: proposed changes and task instructions.',
      },
    ],
    guidance: ['Comment on the Principal sports centre changes, challenge weak assumptions, and offer committee suggestions.', 'Trap: do not accept the proposed entrance fee without addressing student concerns.'],
    prompt:
      'Write a letter to the Principal as a member of the student committee at an international college about proposed changes to the sports centre. The Principal thinks the problems are an overcrowded indoor court, a small coffee bar and a sauna too far from the pool, and may introduce a five-pound entrance fee. Use the committee notes to comment on the plans and offer suggestions, including a possible booking system, opening the centre to the public to cover costs, better gym equipment, and support for the improved coffee bar and layout. Do not include postal addresses.',
  },
  {
    id: 'q-cam-cae5-w-t3-p2-2',
    test: 3,
    part: 2,
    taskNumber: 2,
    title: 'Country representative article',
    genre: 'Article',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 3, Paper 2 Writing, Part 2',
    guidance: ['Name a famous representative, explain why the person attracts interest, and evaluate the national image presented.', 'Trap: include opinion, not just biography.'],
    prompt:
      'Write an article for Tourism Today about the best-known representative of your country, such as a pop star, sports personality or film star. Tell readers about this person, explain why he or she attracts so much interest, and give your opinion about the image he or she presents.',
  },
  {
    id: 'q-cam-cae5-w-t3-p2-3',
    test: 3,
    part: 2,
    taskNumber: 3,
    title: 'Independent English learning leaflet',
    genre: 'Leaflet',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 3, Paper 2 Writing, Part 2',
    guidance: ['Give practical tips for improving English without a teacher.', 'Trap: use leaflet-style direct advice, not an academic essay.'],
    prompt:
      'Write the text for a leaflet for members of an English language social club who cannot attend an English course and need suggestions and practical advice on how to improve their English independently.',
  },
  {
    id: 'q-cam-cae5-w-t3-p2-4',
    test: 3,
    part: 2,
    taskNumber: 4,
    title: 'Changing job status report',
    genre: 'Report',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 3, Paper 2 Writing, Part 2',
    guidance: ['Describe how job respect has changed, explain causes, and predict future changes in job status.', 'Trap: make the report country-specific.'],
    prompt:
      'Write a report for an international survey about attitudes to jobs in your country. Describe ways in which some jobs have gained or lost respect during the past twenty years, explain why this has occurred, and say what other changes in job status may take place in the future.',
  },
  {
    id: 'q-cam-cae5-w-t3-p2-5',
    test: 3,
    part: 2,
    taskNumber: 5,
    title: 'Department retraining proposal',
    genre: 'Proposal',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 3, Paper 2 Writing, Part 2',
    guidance: ['Outline which staff should be retrained, the type and length of training, and benefits to the company.', 'Trap: the proposal must support department expansion.'],
    prompt:
      'Write a proposal for your manager because the company is closing some departments but your department will expand and needs employees from the departments closing. Outline which staff should be retrained, what sort of retraining they will require, how long it will take, and how the company will benefit.',
  },
  {
    id: 'q-cam-cae5-w-t4-p1',
    test: 4,
    part: 1,
    taskNumber: 1,
    title: 'Charity day correction letter',
    genre: 'Letter',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 4, Paper 2 Writing, Part 1',
    visuals: [
      {
        src: '/assets/cae/visual-inputs/cae5-writing-test4-input-1.png',
        alt: 'CAE 5 Test 4 Writing Part 1 inaccurate charity day report and Maria note',
        caption: 'CAE 5 Test 4 Writing Part 1 source page: newspaper report and Maria note.',
      },
      {
        src: '/assets/cae/visual-inputs/cae5-writing-test4-input-2.png',
        alt: 'CAE 5 Test 4 Writing Part 1 charity day results pie chart',
        caption: 'CAE 5 Test 4 Writing Part 1 source page: charity day distribution of income chart.',
      },
    ],
    guidance: ['Correct the newspaper account of the charity day and ask for a printed apology.', 'Trap: use the chart information to rebut claims about attendance, weather, money raised and costs.'],
    prompt:
      'Write a letter to the editor of a newspaper correcting an inaccurate report called Washout for Charity Day. You helped at a fund-raising day for the local hospital in Cooper Park. Your friend Maria says the report was wrong: the organisers were not disappointed, the rain was only a small shower, the event did raise money, and less than half the money was spent on costs. Use the Distribution of Income chart showing money given to the hospital, administration costs and cost of entertainment. Give the correct version of events and ask for an apology. Do not include postal addresses.',
  },
  {
    id: 'q-cam-cae5-w-t4-p2-2',
    test: 4,
    part: 2,
    taskNumber: 2,
    title: 'Computer games review',
    genre: 'Review',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 4, Paper 2 Writing, Part 2',
    guidance: ['Compare and contrast two computer games, covering graphics, appeal and value for money.', 'Trap: make evaluative comparisons, not separate descriptions only.'],
    prompt:
      'Write a review for an international magazine comparing and contrasting two different computer games. Comment on graphics and visuals, the appeal of each game, and value for money.',
  },
  {
    id: 'q-cam-cae5-w-t4-p2-3',
    test: 4,
    part: 2,
    taskNumber: 3,
    title: 'Historical travel competition entry',
    genre: 'Competition Entry',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 4, Paper 2 Writing, Part 2',
    guidance: ['Describe the chosen time and place, what you might experience, and why that choice matters.', 'Trap: avoid a pure history lecture; make the imagined experience vivid.'],
    prompt:
      'Write a competition entry for an international magazine: If you could travel back to any place and time in history, where and when would you choose? Describe what you might experience and explain why you would choose this particular place and time.',
  },
  {
    id: 'q-cam-cae5-w-t4-p2-4',
    test: 4,
    part: 2,
    taskNumber: 4,
    title: 'Driving test advice article',
    genre: 'Article',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 4, Paper 2 Writing, Part 2',
    guidance: ['Suggest how to prepare for a driving test and what to do or avoid on test day.', 'Trap: structure advice clearly for magazine readers.'],
    prompt:
      'Write an article for an international motoring magazine called How to Pass Your Driving Test. Suggest how best to prepare for a driving test and say what candidates should or should not do on the day of the test itself.',
  },
  {
    id: 'q-cam-cae5-w-t4-p2-5',
    test: 4,
    part: 2,
    taskNumber: 5,
    title: 'Office equipment report',
    genre: 'Report',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 5, Test 4, Paper 2 Writing, Part 2',
    guidance: ['State limitations of current equipment and explain how investment would improve department performance.', 'Trap: keep the report business-focused and evidence-based.'],
    prompt:
      'Write a report for the Managing Director after your department requested more office equipment. State the limitations of the equipment currently used and explain how additional investment would improve your department performance.',
  },
];

export const CAE6_WRITING_TASKS: CAEWritingTask[] = [
  {
    id: 'q-cam-cae6-w-t1-p1',
    test: 1,
    part: 1,
    taskNumber: 1,
    title: 'Letter to the editor: Greendale Park',
    genre: 'Letter',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 1, Paper 2 Writing, Part 1',
    prompt:
      'Write a letter to the editor of the local newspaper about the council plan to turn Greendale Park into a car park. Use the input material: the newspaper article says the council believes the old park is no longer useful and that more town-centre parking is needed; a survey shows 22% never use the park, 52% use it at least once a week, and 26% use it daily; local residents mention lunchtime fresh air, children using the swings, and the tennis courts. Refer to possible alternatives such as an underground car park or using the empty factory site. State your view clearly. Do not include postal addresses.',
  },
  {
    id: 'q-cam-cae6-w-t1-p2-2',
    test: 1,
    part: 2,
    taskNumber: 2,
    title: 'Sports article',
    genre: 'Article',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 1, Paper 2 Writing, Part 2',
    prompt:
      'Sports Watch magazine wants articles on the sports people most enjoy watching in different countries. Write an article describing two sports you enjoy watching and explaining whether sports in your country are becoming more influenced by sports from abroad.',
  },
  {
    id: 'q-cam-cae6-w-t1-p2-3',
    test: 1,
    part: 2,
    taskNumber: 3,
    title: 'Time capsule competition entry',
    genre: 'Competition Entry',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 1, Paper 2 Writing, Part 2',
    prompt:
      'Write a competition entry for a time capsule that will be opened in 100 years. Recommend three things that best represent life and culture today and explain why people in the future would find each one interesting.',
  },
  {
    id: 'q-cam-cae6-w-t1-p2-4',
    test: 1,
    part: 2,
    taskNumber: 4,
    title: 'Education report',
    genre: 'Report',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 1, Paper 2 Writing, Part 2',
    prompt:
      'Write a report on education in your country. Describe its strengths and weaknesses and comment on likely developments in the future.',
  },
  {
    id: 'q-cam-cae6-w-t1-p2-5',
    test: 1,
    part: 2,
    taskNumber: 5,
    title: 'Work abroad proposal',
    genre: 'Proposal',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 1, Paper 2 Writing, Part 2',
    prompt:
      'Write a proposal to your head of department about working abroad in a foreign company for up to three months. State what kind of company you would like to work for and why, explain what you would do there, and describe how the experience would benefit your present company.',
  },
  {
    id: 'q-cam-cae6-w-t2-p1',
    test: 2,
    part: 1,
    taskNumber: 1,
    title: 'Exchange programme article',
    genre: 'Article',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 2, Paper 2 Writing, Part 1',
    prompt:
      'Write an article for your college English newspaper about an exchange programme in Canada. Use the input material: the programme offers stays in Canada, the USA or Britain for one to eight weeks with a local family, social life, and the chance to host a foreign student the following year; students must consider travel and pocket money. Include what you enjoyed, explain the problems you had, and encourage other students to take part. Relevant notes include the Rocky Mountains, bears, camping, a kind family, good food, limited evening activities, higher-than-expected costs, not enough money, and having to share a room.',
  },
  {
    id: 'q-cam-cae6-w-t2-p2-2',
    test: 2,
    part: 2,
    taskNumber: 2,
    title: 'Music festival judge application',
    genre: 'Letter of Application',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 2, Paper 2 Writing, Part 2',
    prompt:
      'Write a letter of application to be a judge at an international music festival. Describe the types of music involved, explain your own musical tastes, and say why you would be a good judge.',
  },
  {
    id: 'q-cam-cae6-w-t2-p2-3',
    test: 2,
    part: 2,
    taskNumber: 3,
    title: 'Temporary jobs guidebook contribution',
    genre: 'Guidebook Contribution',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 2, Paper 2 Writing, Part 2',
    prompt:
      'Write a contribution for a guidebook called A Guide to Temporary Jobs Around the World. Describe two or three vacation jobs, explain how to find them, comment on pay and conditions, and give advice about possible problems.',
  },
  {
    id: 'q-cam-cae6-w-t2-p2-4',
    test: 2,
    part: 2,
    taskNumber: 4,
    title: 'College sports leaflet',
    genre: 'Leaflet',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 2, Paper 2 Writing, Part 2',
    prompt:
      'Write a leaflet for students at an international college. Describe the sports facilities and recreational activities available, explain their benefits, and encourage students to use them.',
  },
  {
    id: 'q-cam-cae6-w-t2-p2-5',
    test: 2,
    part: 2,
    taskNumber: 5,
    title: 'Business visit letter',
    genre: 'Business Letter',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 2, Paper 2 Writing, Part 2',
    prompt:
      'Write a business letter to the leader of an international business group that will visit your company. Introduce the company, outline a programme for the visit, and explain what the group will learn about good working practices.',
  },
  {
    id: 'q-cam-cae6-w-t3-p1',
    test: 3,
    part: 1,
    taskNumber: 1,
    title: 'TV filming proposal',
    genre: 'Proposal',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 3, Paper 2 Writing, Part 1',
    prompt:
      'Write a proposal to a television company that wants to film at your language college. Use the input material from the principal and planning notes. Choose suitable aspects to film, such as modernised classrooms, the library, the canteen, the sports field or the garden, but avoid weak options such as a noisy language lab or an unsuitable conversation class. Suggest suitable interviewees and explain how the film can create a positive impression of the college.',
  },
  {
    id: 'q-cam-cae6-w-t3-p2-2',
    test: 3,
    part: 2,
    taskNumber: 2,
    title: 'Young people issue article',
    genre: 'Article',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 3, Paper 2 Writing, Part 2',
    prompt:
      'Write an article for Youth Matters magazine about an important issue facing young people in your country. The issue may relate to work, education or the environment. Explain why it matters and what could be done.',
  },
  {
    id: 'q-cam-cae6-w-t3-p2-3',
    test: 3,
    part: 2,
    taskNumber: 3,
    title: 'Tourist guide character reference',
    genre: 'Character Reference',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 3, Paper 2 Writing, Part 2',
    prompt:
      'Write a character reference for a family friend who is applying for a job as a tourist guide. Explain how long you have known the person, describe their character, and say why they would be suitable for the job.',
  },
  {
    id: 'q-cam-cae6-w-t3-p2-4',
    test: 3,
    part: 2,
    taskNumber: 4,
    title: 'Leisure facility competition entry',
    genre: 'Competition Entry',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 3, Paper 2 Writing, Part 2',
    prompt:
      'Write a competition entry proposing a new leisure facility for the place where you live, work or study. Explain what facility is needed, what it would provide, and who would benefit from it.',
  },
  {
    id: 'q-cam-cae6-w-t3-p2-5',
    test: 3,
    part: 2,
    taskNumber: 5,
    title: 'Health and safety leaflet',
    genre: 'Leaflet',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 3, Paper 2 Writing, Part 2',
    prompt:
      'Write a leaflet for new employees about health and safety. Describe the equipment used, explain how to use it safely, and state the emergency procedure.',
  },
  {
    id: 'q-cam-cae6-w-t4-p1',
    test: 4,
    part: 1,
    taskNumber: 1,
    title: 'Arts Centre letter',
    genre: 'Letter',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 4, Paper 2 Writing, Part 1',
    prompt:
      'Write a letter to the Arts Centre manager after the opening of the new centre. Thank the manager for the invitation, mention positive points such as the atmosphere, food and theatre, explain disappointment that some promises were not kept, and suggest a meeting. Use the input material: promised student use of a recording studio, music and rehearsal rooms, a theatre for annual productions, a programme of unusual international films for cinema courses, an Arts Library and a student discount. The opening handout/notes suggest the cinema mostly shows big-name films, there is no recording studio, the Arts Library exists, the music and rehearsal rooms are for hire, and the discount appears lower than promised.',
  },
  {
    id: 'q-cam-cae6-w-t4-p2-2',
    test: 4,
    part: 2,
    taskNumber: 2,
    title: 'Mobile phones article',
    genre: 'Article',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 4, Paper 2 Writing, Part 2',
    prompt:
      'Write an article for International Technology Today about the impact of mobile phones on modern society. Discuss personal and business uses and consider both advantages and disadvantages.',
  },
  {
    id: 'q-cam-cae6-w-t4-p2-3',
    test: 4,
    part: 2,
    taskNumber: 3,
    title: 'Sports event venue proposal',
    genre: 'Proposal',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 4, Paper 2 Writing, Part 2',
    prompt:
      'Write a proposal to a sports event organising committee explaining why your town would be a suitable venue. Cover accommodation, transport and entertainment.',
  },
  {
    id: 'q-cam-cae6-w-t4-p2-4',
    test: 4,
    part: 2,
    taskNumber: 4,
    title: 'Studying and student life leaflet',
    genre: 'Leaflet',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 4, Paper 2 Writing, Part 2',
    prompt:
      'Write a leaflet called Studying and Student Life. Give advice about methods of study, suitable accommodation and social life.',
  },
  {
    id: 'q-cam-cae6-w-t4-p2-5',
    test: 4,
    part: 2,
    taskNumber: 5,
    title: 'Trade fair report',
    genre: 'Report',
    wordCount: 'approximately 250 words',
    source: 'Cambridge CAE 6, Test 4, Paper 2 Writing, Part 2',
    prompt:
      'Write a report after visiting a trade fair. Describe what you saw and experienced and explain why your company should have a stand at the fair next year.',
  },
];

const commonCaeInterviewPrompt =
  'Answer short interview questions about where you are from, what you do, how long you have studied English, other languages you have studied, first impressions of life in another country, local entertainment and leisure facilities, advantages of learning a language where it is spoken, a future life change, recent interesting events, the importance of English in your country, living abroad permanently, influential people, and meeting someone famous.';

export const CAE4_SPEAKING_TASKS: CAESpeakingTask[] = [
  {
    id: 'q-cam-cae4-s-t1-p1',
    test: 1,
    part: 1,
    title: 'Interview: personal background and future plans',
    source: 'Cambridge CAE 4, Test 1, Paper 5 Speaking, Part 1',
    focus: ['interview', 'personal-response'],
    guidance: ['Give concise answers, then extend naturally with one reason or example.'],
    prompt: commonCaeInterviewPrompt,
  },
  {
    id: 'q-cam-cae4-s-t1-p2',
    test: 1,
    part: 2,
    title: 'Long turn: travel adverts and mobile phones',
    source: 'Cambridge CAE 4, Test 1, Paper 5 Speaking, Part 2',
    focus: ['long-turn', 'compare-contrast', 'advertising'],
    guidance: ['Compare before interpreting message or usefulness; avoid only describing pictures.'],
    prompt:
      'Set 1: compare and contrast advertisements for travelling by ship, saying when they may have been produced and what messages they convey. Follow-up: decide which advertisement appeals more. Set 2: compare and contrast people using mobile phones, saying why they may have bought a mobile phone and how useful it is. Follow-up: discuss whether portable phones are useful.',
  },
  {
    id: 'q-cam-cae4-s-t1-p3',
    test: 1,
    part: 3,
    title: 'Collaborative task: early-morning programme',
    source: 'Cambridge CAE 4, Test 1, Paper 5 Speaking, Part 3',
    focus: ['collaboration', 'decision-making', 'media'],
    guidance: ['Negotiate style, content, duration and audience before deciding.'],
    prompt:
      'Work with a partner to plan a new early-morning TV or radio programme. Discuss possible style, content, duration and target audience, then decide what the programme should be like.',
  },
  {
    id: 'q-cam-cae4-s-t1-p4',
    test: 1,
    part: 4,
    title: 'Discussion: radio, TV and advertising',
    source: 'Cambridge CAE 4, Test 1, Paper 5 Speaking, Part 4',
    focus: ['discussion', 'media', 'opinion'],
    guidance: ['Use examples from audience habits and media strengths to support abstract opinions.'],
    prompt:
      'Discuss radio versus television, who watches or listens early in the morning, why some people may not be interested, the advantages of TV over other media, and advertising on TV or radio.',
  },
  {
    id: 'q-cam-cae4-s-t2-p1',
    test: 2,
    part: 1,
    title: 'Interview: English study and personal experience',
    source: 'Cambridge CAE 4, Test 2, Paper 5 Speaking, Part 1',
    focus: ['interview', 'personal-response'],
    guidance: ['Keep answers short but not minimal; add one specific detail.'],
    prompt: commonCaeInterviewPrompt,
  },
  {
    id: 'q-cam-cae4-s-t2-p2',
    test: 2,
    part: 2,
    title: 'Long turn: entertainment events',
    source: 'Cambridge CAE 4, Test 2, Paper 5 Speaking, Part 2',
    focus: ['long-turn', 'entertainment', 'atmosphere'],
    guidance: ['Describe atmosphere and audience type, then compare preferences.'],
    prompt:
      'Compare and contrast pictures of different kinds of entertainment. Say what the atmosphere may be like at each event and what sort of person would enjoy it. Follow-up: decide which event you would least enjoy.',
  },
  {
    id: 'q-cam-cae4-s-t2-p3',
    test: 2,
    part: 3,
    title: 'Collaborative task: island tourist development',
    source: 'Cambridge CAE 4, Test 2, Paper 5 Speaking, Part 3',
    focus: ['collaboration', 'tourism', 'decision-making'],
    guidance: ['Balance practicality, cost, environmental impact and visitor appeal.'],
    prompt:
      'Discuss possible ways to link an island to the mainland as part of tourist development. Choose the three best options and explain why they would work.',
  },
  {
    id: 'q-cam-cae4-s-t2-p4',
    test: 2,
    part: 4,
    title: 'Discussion: transport, tourism and environment',
    source: 'Cambridge CAE 4, Test 2, Paper 5 Speaking, Part 4',
    focus: ['discussion', 'tourism', 'environment'],
    guidance: ['Make trade-offs explicit when discussing development and transport.'],
    prompt:
      'Discuss dangerous transport methods, tourist development in your area, environmental considerations, places unsuitable for theme parks or holiday resorts, and your preferred transport method.',
  },
  {
    id: 'q-cam-cae4-s-t3-p1',
    test: 3,
    part: 1,
    title: 'Interview: background and interests',
    source: 'Cambridge CAE 4, Test 3, Paper 5 Speaking, Part 1',
    focus: ['interview', 'personal-response'],
    guidance: ['Use natural discourse markers and avoid memorised biography.'],
    prompt: commonCaeInterviewPrompt,
  },
  {
    id: 'q-cam-cae4-s-t3-p2',
    test: 3,
    part: 2,
    title: 'Long turn: shopping and playground description',
    source: 'Cambridge CAE 4, Test 3, Paper 5 Speaking, Part 2',
    focus: ['long-turn', 'compare-contrast', 'description'],
    guidance: ['For comparison, move beyond what is visible; for description, organise from general to detail.'],
    prompt:
      'Set 1: compare and contrast two different ways of shopping, going out to shops and shopping by post, and say what message the artist may be conveying. Follow-up: state which way of shopping you prefer. Set 2: describe pictures of a children playground clearly enough for a partner to identify which picture has not been described.',
  },
  {
    id: 'q-cam-cae4-s-t3-p3',
    test: 3,
    part: 3,
    title: 'Collaborative task: pollution problems',
    source: 'Cambridge CAE 4, Test 3, Paper 5 Speaking, Part 3',
    focus: ['collaboration', 'environment', 'problem-solving'],
    guidance: ['Discuss effects first, then prioritise future risk and possible control.'],
    prompt:
      'Discuss pictures of different types of pollution. Talk about their effects on the world, decide which are likely to become the worst future problems, and suggest how they could be controlled.',
  },
  {
    id: 'q-cam-cae4-s-t3-p4',
    test: 3,
    part: 4,
    title: 'Discussion: pollution and responsibility',
    source: 'Cambridge CAE 4, Test 3, Paper 5 Speaking, Part 4',
    focus: ['discussion', 'environment', 'responsibility'],
    guidance: ['Support opinions with realistic examples of individual, corporate and government action.'],
    prompt:
      'Discuss other harmful forms of pollution, responsibility for controlling pollution, what ordinary people can do, penalties, environmental education by age, and the greatest environmental problem in your country.',
  },
  {
    id: 'q-cam-cae4-s-t4-p1',
    test: 4,
    part: 1,
    title: 'Interview: personal experience and goals',
    source: 'Cambridge CAE 4, Test 4, Paper 5 Speaking, Part 1',
    focus: ['interview', 'personal-response'],
    guidance: ['Vary tense and modality when talking about experience and future plans.'],
    prompt: commonCaeInterviewPrompt,
  },
  {
    id: 'q-cam-cae4-s-t4-p2',
    test: 4,
    part: 2,
    title: 'Long turn: interviews',
    source: 'Cambridge CAE 4, Test 4, Paper 5 Speaking, Part 2',
    focus: ['long-turn', 'description', 'inference'],
    guidance: ['Describe the people, infer the interviewer goal, and explain likely responses.'],
    prompt:
      'Compare and contrast pictures of people being interviewed. Say as much as possible about the people, what information the interviewer may want, and how the person may respond. Follow-up: say which person you would most like to interview.',
  },
  {
    id: 'q-cam-cae4-s-t4-p3',
    test: 4,
    part: 3,
    title: 'Collaborative task: useful courses for jobs',
    source: 'Cambridge CAE 4, Test 4, Paper 5 Speaking, Part 3',
    focus: ['collaboration', 'education', 'work'],
    guidance: ['Classify courses as practical or academic before choosing the most useful for employment.'],
    prompt:
      'Discuss a set of advertised courses. Decide which courses are available, whether they are practical or academic, and choose two or three that would be most useful for finding a job.',
  },
  {
    id: 'q-cam-cae4-s-t4-p4',
    test: 4,
    part: 4,
    title: 'Discussion: work and future skills',
    source: 'Cambridge CAE 4, Test 4, Paper 5 Speaking, Part 4',
    focus: ['discussion', 'work', 'future-skills'],
    guidance: ['Use cause-effect language when discussing changes in work and family life.'],
    prompt:
      'Discuss skills needed for future jobs, how jobs have changed, the effect of both parents working on family life, suitable retirement age, and skills needed for your chosen career.',
  },
];

export const CAE5_SPEAKING_TASKS: CAESpeakingTask[] = [
  {
    id: 'q-cam-cae5-s-t1-p1',
    test: 1,
    part: 1,
    title: 'Interview: life, language and influence',
    source: 'Cambridge CAE 5, Test 1, Paper 5 Speaking, Part 1',
    focus: ['interview', 'personal-response'],
    guidance: ['Answer naturally and extend with a reason, example or contrast.'],
    prompt: commonCaeInterviewPrompt,
  },
  {
    id: 'q-cam-cae5-s-t1-p2',
    test: 1,
    part: 2,
    title: 'Long turn: groups and important papers',
    source: 'Cambridge CAE 5, Test 1, Paper 5 Speaking, Part 2',
    focus: ['long-turn', 'compare-contrast', 'inference'],
    guidance: ['Explain group responsibilities and dependence, then interpret the significance of documents.'],
    prompt:
      'Set 1: compare and contrast pictures of different groups of people, saying what responsibilities the members have as a group and how they might depend on each other. Follow-up: say which group would be most interesting to belong to. Set 2: compare and contrast people with pieces of paper, saying what significance the papers might have and how the people might be feeling. Follow-up: decide which pieces of paper look most important.',
  },
  {
    id: 'q-cam-cae5-s-t1-p3',
    test: 1,
    part: 3,
    title: 'Collaborative task: priorities at life stages',
    source: 'Cambridge CAE 5, Test 1, Paper 5 Speaking, Part 3',
    focus: ['collaboration', 'life-stages', 'decision-making'],
    guidance: ['Discuss how attitudes change by life stage before deciding priorities.'],
    prompt:
      'Discuss pictures of things that are important at different stages of peoples lives. Talk about how attitudes towards these things may change at different life stages, then decide what the greatest priority might be at each stage.',
  },
  {
    id: 'q-cam-cae5-s-t1-p4',
    test: 1,
    part: 4,
    title: 'Discussion: values across life',
    source: 'Cambridge CAE 5, Test 1, Paper 5 Speaking, Part 4',
    focus: ['discussion', 'values', 'age'],
    guidance: ['Use balanced comparisons between youth, adulthood and old age.'],
    prompt:
      'Discuss what is important in life, whether youth is the best time of life, whether people become more or less tolerant as they know each other better, attitudes towards elderly people, and whether older people think more about the past, present or future.',
  },
  {
    id: 'q-cam-cae5-s-t2-p1',
    test: 2,
    part: 1,
    title: 'Interview: language learning and life abroad',
    source: 'Cambridge CAE 5, Test 2, Paper 5 Speaking, Part 1',
    focus: ['interview', 'personal-response'],
    guidance: ['Use specific examples to avoid generic short answers.'],
    prompt: commonCaeInterviewPrompt,
  },
  {
    id: 'q-cam-cae5-s-t2-p2',
    test: 2,
    part: 2,
    title: 'Long turn: accuracy matters',
    source: 'Cambridge CAE 5, Test 2, Paper 5 Speaking, Part 2',
    focus: ['long-turn', 'accuracy', 'consequence'],
    guidance: ['Say why accuracy matters and what could happen if it failed.'],
    prompt:
      'Compare and contrast pairs of pictures showing situations in which being accurate is important. Say how important it is for the people to be accurate and what might happen if they were not. Follow-up: decide in which situation accuracy is most important.',
  },
  {
    id: 'q-cam-cae5-s-t2-p3',
    test: 2,
    part: 3,
    title: 'Collaborative task: environmental T-shirt',
    source: 'Cambridge CAE 5, Test 2, Paper 5 Speaking, Part 3',
    focus: ['collaboration', 'environment', 'design'],
    guidance: ['Evaluate design impact, clarity and persuasion before choosing.'],
    prompt:
      'Imagine you are helping design a T-shirt to make people more aware of the environment. Discuss several designs, say how successful they might be in raising awareness, and decide which design would be most appropriate.',
  },
  {
    id: 'q-cam-cae5-s-t2-p4',
    test: 2,
    part: 4,
    title: 'Discussion: environmental awareness',
    source: 'Cambridge CAE 5, Test 2, Paper 5 Speaking, Part 4',
    focus: ['discussion', 'environment', 'responsibility'],
    guidance: ['Contrast individual and government responsibility using evidence or examples.'],
    prompt:
      'Discuss ways to make people more aware of the environment, whether government or individuals should be responsible, whether it is too late to reverse environmental damage, the role of the countryside today, and whether simple things make life worth living.',
  },
  {
    id: 'q-cam-cae5-s-t3-p1',
    test: 3,
    part: 1,
    title: 'Interview: personal profile and language goals',
    source: 'Cambridge CAE 5, Test 3, Paper 5 Speaking, Part 1',
    focus: ['interview', 'personal-response'],
    guidance: ['Show range by using past experience, present habit and future intention.'],
    prompt: commonCaeInterviewPrompt,
  },
  {
    id: 'q-cam-cae5-s-t3-p2',
    test: 3,
    part: 2,
    title: 'Long turn: flowers and observation',
    source: 'Cambridge CAE 5, Test 3, Paper 5 Speaking, Part 2',
    focus: ['long-turn', 'compare-contrast', 'inference'],
    guidance: ['Infer significance and motivation, not only visible details.'],
    prompt:
      'Set 1: compare and contrast people with flowers in different situations, saying what significance the flowers might have for the people concerned. Follow-up: decide who has taken the most care choosing their flowers. Set 2: compare and contrast people observing different things, saying what they might be observing and why. Follow-up: decide who is showing the most interest.',
  },
  {
    id: 'q-cam-cae5-s-t3-p3',
    test: 3,
    part: 3,
    title: 'Collaborative task: cultural understanding ideas',
    source: 'Cambridge CAE 5, Test 3, Paper 5 Speaking, Part 3',
    focus: ['collaboration', 'culture', 'decision-making'],
    guidance: ['Evaluate effectiveness for real cross-cultural understanding.'],
    prompt:
      'Imagine an international organisation wants to encourage greater understanding between people of different cultures. Discuss a set of ideas, say how effective each might be, and decide which two would be most effective.',
  },
  {
    id: 'q-cam-cae5-s-t3-p4',
    test: 3,
    part: 4,
    title: 'Discussion: cultures and languages',
    source: 'Cambridge CAE 5, Test 3, Paper 5 Speaking, Part 4',
    focus: ['discussion', 'culture', 'languages'],
    guidance: ['Use examples from travel, everyday life and language learning.'],
    prompt:
      'Discuss what people can learn by travelling to different countries, how people can understand each other better in everyday life, whether people are the same the world over, whether national characteristics will disappear, and the importance of learning different languages.',
  },
  {
    id: 'q-cam-cae5-s-t4-p1',
    test: 4,
    part: 1,
    title: 'Interview: life and future change',
    source: 'Cambridge CAE 5, Test 4, Paper 5 Speaking, Part 1',
    focus: ['interview', 'personal-response'],
    guidance: ['Keep responses fluent, concrete and lightly extended.'],
    prompt: commonCaeInterviewPrompt,
  },
  {
    id: 'q-cam-cae5-s-t4-p2',
    test: 4,
    part: 2,
    title: 'Long turn: journeys and horses',
    source: 'Cambridge CAE 5, Test 4, Paper 5 Speaking, Part 2',
    focus: ['long-turn', 'description', 'inference'],
    guidance: ['Describe selected pictures clearly enough for the partner to identify missing pictures.'],
    prompt:
      'Set 1: describe two pictures of people travelling around town, saying why the people might be travelling and how comfortable their journeys might be. The partner should identify which two pictures were not described. Set 2: describe two pictures of people and horses, saying how important the horses might be to the people. The partner should identify which two pictures were not described.',
  },
  {
    id: 'q-cam-cae5-s-t4-p3',
    test: 4,
    part: 3,
    title: 'Collaborative task: famous events',
    source: 'Cambridge CAE 5, Test 4, Paper 5 Speaking, Part 3',
    focus: ['collaboration', 'history', 'impact'],
    guidance: ['Discuss impact on the modern world before choosing greatest influence.'],
    prompt:
      'Discuss pictures showing when some famous events first took place. Talk about the effect each event has had on the world we live in, then decide which one has had the greatest influence on peoples lives.',
  },
  {
    id: 'q-cam-cae5-s-t4-p4',
    test: 4,
    part: 4,
    title: 'Discussion: experience, effort and the future',
    source: 'Cambridge CAE 5, Test 4, Paper 5 Speaking, Part 4',
    focus: ['discussion', 'future', 'achievement'],
    guidance: ['Support abstract claims with concrete historical or personal examples.'],
    prompt:
      'Discuss which famous event you would like to have been involved in, the importance of enjoying new experiences, whether anything can be achieved without effort, what aspects of life today will be remembered in the future, and how life may change during the twenty-first century.',
  },
];

export const CAE6_SPEAKING_TASKS: CAESpeakingTask[] = [
  {
    id: 'q-cam-cae6-s-t1-p1',
    test: 1,
    part: 1,
    title: 'Interview: personal information and study',
    source: 'Cambridge CAE 6, Test 1, Paper 5 Speaking, Part 1',
    focus: ['interview', 'personal-response'],
    prompt:
      'Answer short interview questions about where you live, how long you have studied English, whether you have studied English with the other candidate, countries you have visited, what you like about living in your country, entertainment and leisure facilities, reasons for studying English, and a change you would like in the future. Then extend answers on topics such as the importance of English, living abroad permanently, recent interesting events, major influences, and early school memories.',
  },
  {
    id: 'q-cam-cae6-s-t1-p2',
    test: 1,
    part: 2,
    title: 'Long turn: music and quiet moments',
    source: 'Cambridge CAE 6, Test 1, Paper 5 Speaking, Part 2',
    focus: ['long-turn', 'compare-contrast'],
    prompt:
      'Long-turn practice. Set 1: compare and contrast pictures of people making music. Say how the people might be feeling and what part music might play in their lives. Follow-up: decide which person seems to be enjoying music most. Set 2: compare and contrast pictures showing moments of peace and quiet. Say how the people might be feeling and why moments like these may be necessary. Follow-up: decide which picture best illustrates peace and quiet.',
  },
  {
    id: 'q-cam-cae6-s-t1-p3',
    test: 1,
    part: 3,
    title: 'Collaborative task: hopes and dreams',
    source: 'Cambridge CAE 6, Test 1, Paper 5 Speaking, Part 3',
    focus: ['collaboration', 'decision-making'],
    prompt:
      'Discuss pictures of people with different hopes and dreams. Talk about what their hopes and dreams may be and how difficult it might be for them to make those dreams come true. Then decide which two dreams are most likely to become reality.',
  },
  {
    id: 'q-cam-cae6-s-t1-p4',
    test: 1,
    part: 4,
    title: 'Discussion: hopes, dreams and the future',
    source: 'Cambridge CAE 6, Test 1, Paper 5 Speaking, Part 4',
    focus: ['discussion', 'abstract-ideas'],
    prompt:
      'Discuss the importance of hopes and dreams, your hopes for the future of the world, aspects of life today that would have seemed impossible in the past, differences between children and adults dreams, and what people can do to make the world better.',
  },
  {
    id: 'q-cam-cae6-s-t2-p1',
    test: 2,
    part: 1,
    title: 'Interview: English study and personal experience',
    source: 'Cambridge CAE 6, Test 2, Paper 5 Speaking, Part 1',
    focus: ['interview', 'personal-response'],
    prompt:
      'Answer short interview questions about where you live, how long you have studied English, studying English with other candidates, countries you have visited, what you like about living in your country, entertainment and leisure facilities, reasons for studying English, and a change you would like in the future. Extend answers with examples and clear reasons.',
  },
  {
    id: 'q-cam-cae6-s-t2-p2',
    test: 2,
    part: 2,
    title: 'Long turn: aiming for perfection',
    source: 'Cambridge CAE 6, Test 2, Paper 5 Speaking, Part 2',
    focus: ['long-turn', 'motivation'],
    prompt:
      'Compare and contrast pictures of people aiming for perfection. Explain how difficult it might be to acquire the skills shown and why people might be motivated to aim for perfection. Follow-up: decide which person appears to have put the most effort into acquiring their skills.',
  },
  {
    id: 'q-cam-cae6-s-t2-p3',
    test: 2,
    part: 3,
    title: 'Collaborative task: exercise leaflet',
    source: 'Cambridge CAE 6, Test 2, Paper 5 Speaking, Part 3',
    focus: ['collaboration', 'persuasion'],
    prompt:
      'A city wants a leaflet to encourage people to take more exercise. Discuss how successful each suggested picture would be for the leaflet, then choose the two pictures that would work best.',
  },
  {
    id: 'q-cam-cae6-s-t2-p4',
    test: 2,
    part: 4,
    title: 'Discussion: health and modern life',
    source: 'Cambridge CAE 6, Test 2, Paper 5 Speaking, Part 4',
    focus: ['discussion', 'health'],
    prompt:
      'Discuss ways of keeping fit and healthy, whether people need money to stay fit, whether people should look after themselves or rely on others, disadvantages of technology that allows people to do almost everything from home, and whether modern medicine and longer lives are always positive.',
  },
  {
    id: 'q-cam-cae6-s-t3-p1',
    test: 3,
    part: 1,
    title: 'Interview: personal background and interests',
    source: 'Cambridge CAE 6, Test 3, Paper 5 Speaking, Part 1',
    focus: ['interview', 'personal-response'],
    prompt:
      'Answer interview questions about where you live, English study, travel experience, living in your country, leisure facilities, study goals and future change. Aim to extend each answer naturally with a reason, example or contrast.',
  },
  {
    id: 'q-cam-cae6-s-t3-p2',
    test: 3,
    part: 2,
    title: 'Long turn: measuring and exploring',
    source: 'Cambridge CAE 6, Test 3, Paper 5 Speaking, Part 2',
    focus: ['long-turn', 'compare-contrast'],
    prompt:
      'Set 1: compare pictures of people measuring things. Say why they might be measuring and how important accuracy is in each situation. Follow-up: decide which situation most requires accuracy. Set 2: compare pictures of people exploring different environments. Say why they might want to explore and what risks may be involved. Follow-up: decide who is taking the greatest risk.',
  },
  {
    id: 'q-cam-cae6-s-t3-p3',
    test: 3,
    part: 3,
    title: 'Collaborative task: worldwide issues',
    source: 'Cambridge CAE 6, Test 3, Paper 5 Speaking, Part 3',
    focus: ['collaboration', 'global-issues'],
    prompt:
      'Discuss pictures representing worldwide issues that worry people. Explain why each issue may be worrying and decide which two issues need improvements most urgently.',
  },
  {
    id: 'q-cam-cae6-s-t3-p4',
    test: 3,
    part: 4,
    title: 'Discussion: improving the world',
    source: 'Cambridge CAE 6, Test 3, Paper 5 Speaking, Part 4',
    focus: ['discussion', 'global-issues'],
    prompt:
      'Discuss what individuals can do to improve the world, the importance of understanding other cultures and customs, whether too much wealth is in the hands of too few people, whether societies learn from past mistakes, and how likely nations are to live peacefully together.',
  },
  {
    id: 'q-cam-cae6-s-t4-p1',
    test: 4,
    part: 1,
    title: 'Interview: current life and future goals',
    source: 'Cambridge CAE 6, Test 4, Paper 5 Speaking, Part 1',
    focus: ['interview', 'personal-response'],
    prompt:
      'Answer interview questions about where you live, English study, travel, entertainment, reasons for studying English, and future change. Build concise C1-level answers with signposting and specific detail.',
  },
  {
    id: 'q-cam-cae6-s-t4-p2',
    test: 4,
    part: 2,
    title: 'Long turn: presentations and food business',
    source: 'Cambridge CAE 6, Test 4, Paper 5 Speaking, Part 2',
    focus: ['long-turn', 'description'],
    prompt:
      'Set 1: describe two pictures showing different ways of giving a presentation to an audience. Explain how each presentation is being given and how it may affect the audience. Follow-up: the other candidate identifies which two pictures were not described. Set 2: describe two pictures of people working in the food business. Explain satisfying aspects and possible problems. Follow-up: the other candidate identifies which two pictures were not described.',
  },
  {
    id: 'q-cam-cae6-s-t4-p3',
    test: 4,
    part: 3,
    title: 'Collaborative task: media jobs',
    source: 'Cambridge CAE 6, Test 4, Paper 5 Speaking, Part 3',
    focus: ['collaboration', 'work'],
    prompt:
      'Discuss pictures of people working in the media. Talk about the skills needed for each job, then decide which job would be the most challenging and which would be the least challenging.',
  },
  {
    id: 'q-cam-cae6-s-t4-p4',
    test: 4,
    part: 4,
    title: 'Discussion: the media',
    source: 'Cambridge CAE 6, Test 4, Paper 5 Speaking, Part 4',
    focus: ['discussion', 'media'],
    prompt:
      'Discuss why people are attracted to working in the media, problems faced by famous media personalities, the advantages and disadvantages of having many TV channels, whether 24-hour TV news is a good idea, and how satellite TV may affect national identity.',
  },
];

const buildWritingSections = (bookNumber: number, tasks: CAEWritingTask[]): EnglishExamSection[] =>
  [1, 2, 3, 4].map((testNumber) => ({
    id: `cam-cae${bookNumber}-writing-test-${testNumber}`,
    title: `Test ${testNumber} Writing`,
    instructions: 'CAE Writing productive-skill practice. These tasks are reviewed with rubric feedback rather than auto-marked answers.',
    questionGroups: [
      {
        id: `cam-cae${bookNumber}-writing-test-${testNumber}-part-1`,
        instruction: 'Part 1 compulsory task. Write the required text in the requested register and cover every input point.',
        questions: tasks.filter((task) => task.test === testNumber && task.part === 1).map(createWritingQuestion),
      },
      {
        id: `cam-cae${bookNumber}-writing-test-${testNumber}-part-2`,
        instruction: 'Part 2 optional tasks. Choose one task and write the requested text.',
        questions: tasks.filter((task) => task.test === testNumber && task.part === 2).map(createWritingQuestion),
      },
    ],
  }));

const buildSpeakingSections = (bookNumber: number, tasks: CAESpeakingTask[]): EnglishExamSection[] =>
  [1, 2, 3, 4].map((testNumber) => ({
    id: `cam-cae${bookNumber}-speaking-test-${testNumber}`,
    title: `Test ${testNumber} Speaking`,
    instructions: 'CAE Speaking productive-skill practice. These tasks are reviewed with rubric feedback rather than auto-marked answers.',
    questionGroups: [1, 2, 3, 4].map((part) => ({
      id: `cam-cae${bookNumber}-speaking-test-${testNumber}-part-${part}`,
      instruction: `CAE Speaking Part ${part}. Record or practise the response, then review fluency, range, accuracy and task fulfilment.`,
      questions: tasks.filter((task) => task.test === testNumber && task.part === part).map(createSpeakingQuestion),
    })),
  }));

export const CAM_CAE4_WRITING_TEST: EnglishExamTest = {
  id: 'cam-cae4-writing',
  exam: 'cae',
  title: 'Cambridge CAE 4 Writing',
  skill: 'writing',
  type: 'academic',
  sections: buildWritingSections(4, CAE4_WRITING_TASKS),
};

export const CAM_CAE4_SPEAKING_TEST: EnglishExamTest = {
  id: 'cam-cae4-speaking',
  exam: 'cae',
  title: 'Cambridge CAE 4 Speaking',
  skill: 'speaking',
  type: 'academic',
  sections: buildSpeakingSections(4, CAE4_SPEAKING_TASKS),
};

export const CAM_CAE5_WRITING_TEST: EnglishExamTest = {
  id: 'cam-cae5-writing',
  exam: 'cae',
  title: 'Cambridge CAE 5 Writing',
  skill: 'writing',
  type: 'academic',
  sections: buildWritingSections(5, CAE5_WRITING_TASKS),
};

export const CAM_CAE5_SPEAKING_TEST: EnglishExamTest = {
  id: 'cam-cae5-speaking',
  exam: 'cae',
  title: 'Cambridge CAE 5 Speaking',
  skill: 'speaking',
  type: 'academic',
  sections: buildSpeakingSections(5, CAE5_SPEAKING_TASKS),
};

export const CAM_CAE6_WRITING_TEST: EnglishExamTest = {
  id: 'cam-cae6-writing',
  exam: 'cae',
  title: 'Cambridge CAE 6 Writing',
  skill: 'writing',
  type: 'academic',
  sections: buildWritingSections(6, CAE6_WRITING_TASKS),
};

export const CAM_CAE6_SPEAKING_TEST: EnglishExamTest = {
  id: 'cam-cae6-speaking',
  exam: 'cae',
  title: 'Cambridge CAE 6 Speaking',
  skill: 'speaking',
  type: 'academic',
  sections: buildSpeakingSections(6, CAE6_SPEAKING_TASKS),
};
