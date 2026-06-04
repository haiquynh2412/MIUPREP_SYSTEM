import type { EnglishExamQuestion, EnglishExamSection, EnglishExamTest } from '../standard';

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
};

type CAESpeakingTask = {
  id: string;
  test: number;
  part: 1 | 2 | 3 | 4;
  title: string;
  prompt: string;
  focus: string[];
  source: string;
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

const writingExplanation = (genre: string) =>
  [
    `Feedback-only CAE ${genre} task.`,
    'Assess against Cambridge C1 criteria: content coverage, communicative achievement, organisation, language range and accuracy.',
    'During review, identify the task requirements, expected register, paragraph plan, useful language, likely traps, and one concrete rewrite target.',
  ].join(' ');

const speakingExplanation = (part: number) =>
  [
    `Feedback-only CAE Speaking Part ${part} task.`,
    'Assess against Cambridge C1 criteria: grammar and vocabulary, discourse management, pronunciation, and interactive communication.',
    'During review, capture missing ideas, weak linking, unclear comparison or justification, pronunciation blockers, and one repeatable speaking drill.',
  ].join(' ');

const createWritingQuestion = (task: CAEWritingTask): EnglishExamQuestion => ({
  id: task.id,
  type: 'writing_task',
  instruction: task.prompt,
  correctAnswer: null,
  acceptedAnswers: feedbackAnswer,
  explanation: writingExplanation(task.genre),
  answerLocation: task.source,
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
  explanation: speakingExplanation(task.part),
  answerLocation: task.source,
  displayMode: 'both',
  category: `cae_speaking_part_${task.part}`,
  topic: speakingTopic(task.part),
});

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

const buildWritingSections = (): EnglishExamSection[] =>
  [1, 2, 3, 4].map((testNumber) => ({
    id: `cam-cae6-writing-test-${testNumber}`,
    title: `Test ${testNumber} Writing`,
    instructions: 'CAE Writing productive-skill practice. These tasks are reviewed with rubric feedback rather than auto-marked answers.',
    questionGroups: [
      {
        id: `cam-cae6-writing-test-${testNumber}-part-1`,
        instruction: 'Part 1 compulsory task. Write the required text in the requested register and cover every input point.',
        questions: CAE6_WRITING_TASKS.filter((task) => task.test === testNumber && task.part === 1).map(createWritingQuestion),
      },
      {
        id: `cam-cae6-writing-test-${testNumber}-part-2`,
        instruction: 'Part 2 optional tasks. Choose one task and write the requested text.',
        questions: CAE6_WRITING_TASKS.filter((task) => task.test === testNumber && task.part === 2).map(createWritingQuestion),
      },
    ],
  }));

const buildSpeakingSections = (): EnglishExamSection[] =>
  [1, 2, 3, 4].map((testNumber) => ({
    id: `cam-cae6-speaking-test-${testNumber}`,
    title: `Test ${testNumber} Speaking`,
    instructions: 'CAE Speaking productive-skill practice. These tasks are reviewed with rubric feedback rather than auto-marked answers.',
    questionGroups: [1, 2, 3, 4].map((part) => ({
      id: `cam-cae6-speaking-test-${testNumber}-part-${part}`,
      instruction: `CAE Speaking Part ${part}. Record or practise the response, then review fluency, range, accuracy and task fulfilment.`,
      questions: CAE6_SPEAKING_TASKS.filter((task) => task.test === testNumber && task.part === part).map(createSpeakingQuestion),
    })),
  }));

export const CAM_CAE6_WRITING_TEST: EnglishExamTest = {
  id: 'cam-cae6-writing',
  exam: 'cae',
  title: 'Cambridge CAE 6 Writing',
  skill: 'writing',
  type: 'academic',
  sections: buildWritingSections(),
};

export const CAM_CAE6_SPEAKING_TEST: EnglishExamTest = {
  id: 'cam-cae6-speaking',
  exam: 'cae',
  title: 'Cambridge CAE 6 Speaking',
  skill: 'speaking',
  type: 'academic',
  sections: buildSpeakingSections(),
};
