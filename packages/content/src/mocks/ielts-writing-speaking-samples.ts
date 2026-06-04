export interface IeltsWritingSample {
  id: string;
  testNum: number;
  taskNum: number;
  type: 'Essay' | 'Report' | 'Letter';
  title: string;
  prompt: string;
  outline: {
    sectionName: string;
    description: string;
  }[];
  collocations: {
    phrase: string;
    vietnamese: string;
    example: string;
  }[];
  sampleAnswer: string;
  wordCount: number;
}

export interface IeltsSpeakingSample {
  id: string;
  part: number;
  title: string;
  prompt: string;
  outline: string[];
  lexicalUpgrades: {
    basic: string;
    upgrade: string;
    meaning: string;
  }[];
  sampleTranscript: string;
}

export const IELTS_WRITING_SAMPLES: IeltsWritingSample[] = [
  {
    id: 'ielts-w-t1-1',
    testNum: 1,
    taskNum: 1,
    type: 'Report',
    title: 'Global Renewable Energy Consumption',
    prompt: 'The bar chart below shows the consumption of renewable energy (solar, wind, and hydroelectric) across three different regions (Europe, Asia, and North America) between 2015 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    outline: [
      {
        sectionName: 'Introduction & Overview',
        description: 'Paraphrase the prompt, detailing the types of renewable energy and regions. Provide a high-level overview highlighting the marked transition toward green energy and Europe\'s dominant position.'
      },
      {
        sectionName: 'Detailed Analysis: Europe & North America',
        description: 'Report specific data points for Europe (exponential solar and wind growth) and North America (moderate, steady increases across all sectors, with hydro remaining strong).'
      },
      {
        sectionName: 'Detailed Analysis: Asia & Regional Comparisons',
        description: 'Detail Asia\'s massive surge in solar energy investment post-2020. Contrast the geographical disparities in hydroelectric power versus volatile solar/wind resources.'
      }
    ],
    collocations: [
      {
        phrase: 'marked transition',
        vietnamese: 'sự chuyển đổi rõ rệt',
        example: 'The data indicates a marked transition toward sustainable energy sources.'
      },
      {
        phrase: 'exponential growth',
        vietnamese: 'sự phát triển vượt bậc, cấp số nhân',
        example: 'Solar energy consumption experienced exponential growth in Asia over the decade.'
      },
      {
        phrase: 'predominantly reliant',
        vietnamese: 'phụ thuộc phần lớn vào',
        example: 'Historically, the manufacturing sector was predominantly reliant on fossil fuels.'
      },
      {
        phrase: 'geographic disparities',
        vietnamese: 'sự chênh lệch lớn về địa lý',
        example: 'Geographic disparities dictate the availability of hydroelectric power across these regions.'
      }
    ],
    sampleAnswer: 'The bar chart delineates the consumption patterns of renewable energy sources—specifically solar, wind, and hydroelectric power—across Europe, Asia, and North America from 2015 to 2025. \n\nOverall, the decade witnessed a marked transition toward green energy across all surveyed regions. Europe consistently occupied the dominant position in total consumption, driven largely by aggressive wind and solar adoption. Conversely, while Asia initially lagged behind, it registered the most exponential growth in solar energy acquisition by the end of the period.\n\nIn Europe, renewable energy consumption surged dramatically. Hydroelectric power remained stable at approximately 150 gigawatt-hours (GWh), while solar and wind energy experienced an upward trajectory. Solar energy consumption doubled from 80 GWh in 2015 to 160 GWh in 2025, and wind energy followed a similar path, peaking at 210 GWh. North America displayed a more moderate but steady increase. Hydroelectric power remained its primary green source, hovering around 180 GWh, while wind and solar energy experienced modest growth, rising by roughly 25% each.\n\nAsia represented a compelling shift in dynamics. Although predominantly reliant on traditional energy sources in 2015, the region invested heavily in sustainable infrastructure. Consequently, Asian solar energy consumption rocketed from a meager 30 GWh in 2015 to a staggering 190 GWh in 2025, eclipsing North American solar figures. Wind energy also saw substantial gains, climbing to 120 GWh, while hydroelectric consumption remained relatively flat due to geographic disparities in river access.',
    wordCount: 247
  },
  {
    id: 'ielts-w-t2-2',
    testNum: 1,
    taskNum: 2,
    type: 'Essay',
    title: 'Free University Education',
    prompt: 'Some people believe that university education should be completely free for all students, regardless of their financial background. Others argue that students should pay tuition fees as it ensures better quality and values degrees. Discuss both views and give your opinion.',
    outline: [
      {
        sectionName: 'Introduction',
        description: 'Introduce the educational equity debate. Paraphrase both sides (free education vs. paid tuition) and state a clear thesis (advocating for a hybrid, subsidized model or free access).'
      },
      {
        sectionName: 'Arguments for Free Higher Education',
        description: 'Discuss how free tuition democratizes education, removes social stratification, and fosters a highly skilled national workforce (intellectual capital).'
      },
      {
        sectionName: 'Arguments for Charging Tuition Fees',
        description: 'Explain the counterarguments: financial sustainability for institutions, preventing the devaluation of degrees, and ensuring students remain accountable and motivated.'
      },
      {
        sectionName: 'Opinion & Conclusion',
        description: 'Synthesize both perspectives. State that while raw tuition fee models breed inequality, state-funded models backed by performance criteria strike a level playing field.'
      }
    ],
    collocations: [
      {
        phrase: 'social stratification',
        vietnamese: 'sự phân tầng xã hội',
        example: 'High academic costs accelerate social stratification by locking low-income students out.'
      },
      {
        phrase: 'fiscal sustainability',
        vietnamese: 'sự vững vàng/bền vững về tài chính',
        example: 'Opponents argue that free university education compromises the fiscal sustainability of top colleges.'
      },
      {
        phrase: 'level playing field',
        vietnamese: 'một sân chơi công bằng',
        example: 'Subsidizing tuition fees creates a level playing field for gifted students of all backgrounds.'
      },
      {
        phrase: 'intellectual capital',
        vietnamese: 'nguồn vốn tri thức, nhân lực trình độ cao',
        example: 'Investing in tertiary education enriches the nation\'s intellectual capital.'
      }
    ],
    sampleAnswer: 'The debate surrounding the accessibility of higher education has intensified in recent years. While some advocates champion the notion that university tuition should be entirely free for all students to foster equity, critics argue that charging fees is vital to maintain academic excellence. In my opinion, while institutional funding is crucial, university education should be fully subsidized by the state to guarantee a level playing field.\n\nOn the one hand, eliminating tuition fees is a powerful catalyst for social mobility. When tertiary education is gated by exorbitant fees, it perpetuates social stratification, confining prestigious professions to affluent demographics. By democratizing access, talented individuals from impoverished backgrounds can acquire advanced skills, thereby elevating their socioeconomic status. Furthermore, an educated populace significantly bolsters a country\'s intellectual capital, sparking technological innovation and driving robust economic growth. For instance, Nordic countries that offer free university education consistently rank exceptionally high in global productivity.\n\nOn the other hand, proponents of tuition fees contend that financial contributions from students are necessary to maintain academic quality. Universities require immense capital to conduct ground-breaking research, maintain state-of-the-art facilities, and attract world-class professors. If the government bears the entire financial burden, public budgets can be strained, potentially leading to compromised standards. Additionally, it is argued that paying fees instills a sense of accountability in students, motivating them to complete their degrees diligently rather than treating their education casually.\n\nIn conclusion, although the concerns regarding fiscal sustainability are valid, they can be solved through fair corporate taxation and targeted state funding. Education should be viewed as a public investment rather than a commercial product. I believe that providing free university education is essential to unlock human potential and build an egalitarian society.',
    wordCount: 298
  },
  {
    id: 'ielts-w-t2-3',
    testNum: 2,
    taskNum: 2,
    type: 'Essay',
    title: 'Urban Waste Crisis',
    prompt: 'In many cities around the world, the amount of waste produced by households and businesses is increasing rapidly. What are the causes of this problem? What measures can be taken to reduce waste?',
    outline: [
      {
        sectionName: 'Introduction',
        description: 'Acknowledge the escalating global threat of urban waste. State that the crisis is propelled by consumerism and single-use packaging, requiring robust legislative and industrial intervention.'
      },
      {
        sectionName: 'Causes of Excessive Waste',
        description: 'Detail the two main drivers: the rise of a convenient "throwaway culture" and corporate reliance on cheap, non-biodegradable plastic packaging.'
      },
      {
        sectionName: 'Effective Solutions & Remedial Measures',
        description: 'Propose direct interventions: implementing stringent environmental regulations on plastic manufacturing and encouraging circular economy practices (recycling & composting).'
      },
      {
        sectionName: 'Conclusion',
        description: 'Reiterate that while the waste epidemic is critical, combining government mandates with public environmental consciousness will secure a sustainable future.'
      }
    ],
    collocations: [
      {
        phrase: 'throwaway culture',
        vietnamese: 'thói quen/văn hóa tiêu dùng nhanh rồi bỏ',
        example: 'The rapid expansion of e-commerce has exacerbated our modern throwaway culture.'
      },
      {
        phrase: 'circular economy',
        vietnamese: 'nền kinh tế tuần hoàn',
        example: 'Transitioning to a circular economy minimizes waste by reusing materials endlessly.'
      },
      {
        phrase: 'stringent regulations',
        vietnamese: 'các quy định nghiêm ngặt',
        example: 'Governments must enforce stringent regulations on single-use plastics.'
      },
      {
        phrase: 'biodegradable alternatives',
        vietnamese: 'các chất liệu tự phân hủy sinh học thay thế',
        example: 'Supermarkets are gradually adopting biodegradable alternatives for food packaging.'
      }
    ],
    sampleAnswer: 'The rapid escalation of municipal solid waste in urban centers has emerged as one of the most pressing ecological challenges of the modern era. This crisis is primarily driven by consumer lifestyle changes and corporate packaging practices. However, this epidemic can be effectively mitigated through a combination of stringent government legislation and the implementation of circular economic models.\n\nThe proliferation of waste is primarily fueled by the rise of a modern throwaway culture. In our fast-paced society, convenience is prioritized over sustainability, leading to massive reliance on single-use items such as disposable coffee cups, plastic bags, and excessive delivery packaging. Furthermore, manufacturing corporations predominantly package their goods in cheap, non-biodegradable plastics rather than investing in eco-friendly containers. This rapid obsolescence of goods, coupled with population expansion in metropolitan hubs, has caused local landfills to overflow, creating a severe environmental hazard.\n\nTo resolve this ecological crisis, multi-stakeholder interventions are required. First, governments must enforce stringent environmental regulations. Charging heavy environmental taxes on corporations that utilize non-recyclable materials will force them to adopt biodegradable alternatives, such as cornstarch or bamboo packaging. Second, local municipalities must transition toward a circular economy. This involves establishing comprehensive recycling schemes, making household waste segregation legally mandatory, and subsidizing compost facilities. For instance, cities like Tokyo have successfully curbed trash volume by imposing strict sorting rules and charging fees for non-recyclable bags.\n\nIn conclusion, the surge in urban waste is a direct consequence of unrestrained consumerism and corporate neglect. Nevertheless, this trend can be reversed. By enforcing strict packing laws and promoting recycling consciousness, we can safeguard our environment for future generations.',
    wordCount: 284
  }
];

export const IELTS_SPEAKING_SAMPLES: IeltsSpeakingSample[] = [
  {
    id: 'ielts-s-p2-1',
    part: 2,
    title: 'An Awe-Inspiring Excursion',
    prompt: 'Describe a memorable journey you went on in the past. You should say: where you went, who you went with, what you did, and explain why it was memorable.',
    outline: [
      'Set the scene: introduce the destination, e.g., an excursion into the dramatic landscapes of the Scottish Highlands.',
      'Detail the activities: driving through misty glens, hiking near majestic lochs, and experiencing local culture.',
      'Explain the memorable aspect: the pristine, unspoiled natural environment and the feeling of therapeutic tranquility.',
      'Summarize the emotional impact: a journey that fostered profound reflection.'
    ],
    lexicalUpgrades: [
      {
        basic: 'nice trip',
        upgrade: 'an awe-inspiring, rejuvenating excursion',
        meaning: 'một chuyến đi đầy cảm hứng và tràn trề sức sống'
      },
      {
        basic: 'beautiful views',
        upgrade: 'picturesque, dramatic vistas and misty glens',
        meaning: 'những khung cảnh đẹp như tranh, thung lũng sương mù hùng vĩ'
      },
      {
        basic: 'very happy',
        upgrade: 'absolutely ecstatic / filled with childlike wonder',
        meaning: 'vô cùng hạnh phúc / ngập tràn sự kinh ngạc như con trẻ'
      },
      {
        basic: 'quiet place',
        upgrade: 'an unspoiled sanctuary of absolute stillness',
        meaning: 'một thánh đường hoang sơ tĩnh lặng tuyệt đối'
      }
    ],
    sampleTranscript: 'I would like to describe an exceptionally memorable journey I undertook two years ago—an awe-inspiring excursion into the dramatic vistas of the Scottish Highlands. I went with two of my closest friends, seeking a brief escape from the constant hustle of city life. \n\nWe rented a car and embarked on a road trip, driving through winding roads carved into misty glens and towering mountains. One of the highlights was hiking near Loch Ness, where the deep, dark water sat beautifully against the lush greenery. We spent our afternoons exploring ancient castle ruins and our evenings enjoying local hospitality in cozy villages. \n\nThis journey was profoundly memorable for several reasons. First, the scenery was unlike anything I had ever witnessed—a picturesque, unspoiled sanctuary of absolute stillness that made me feel filled with childlike wonder. Second, it was a valuable opportunity to unplug from technology. We had virtually no internet reception, which allowed us to engage in deep conversations. Ultimately, this trip was not just a vacation, but a therapeutic experience that rejuvenated my mind.'
  },
  {
    id: 'ielts-s-p3-2',
    part: 3,
    title: 'The Tourism Dilemma',
    prompt: 'Do you think tourism has a positive or negative impact on local cultures? Why?',
    outline: [
      'State a balanced, analytical thesis: tourism is a double-edged sword.',
      'Discuss positive impacts: tourism injects vital capital, helps fund cultural heritage preservation, and fosters cross-cultural empathy.',
      'Discuss negative impacts: commercialization of sacred rituals, cultural homogenization, and inflation for locals.',
      'Conclude with the necessity of sustainable, mindful travel practices.'
    ],
    lexicalUpgrades: [
      {
        basic: 'brings money',
        upgrade: 'injects vital capital into local economies',
        meaning: 'bơm nguồn vốn quan trọng vào nền kinh tế địa phương'
      },
      {
        basic: 'ruins tradition',
        upgrade: 'precipitates cultural homogenization and commercialization',
        meaning: 'gây ra sự đồng hóa văn hóa và thương mại hóa thái quá'
      },
      {
        basic: 'helps people understand',
        upgrade: 'fosters profound cross-cultural empathy',
        meaning: 'nuôi dưỡng sự thấu hiểu sâu sắc giữa các nền văn hóa'
      },
      {
        basic: 'good solution',
        upgrade: 'implementing sustainable, ethical tourism frameworks',
        meaning: 'triển khai khuôn khổ du lịch bền vững và có đạo đức'
      }
    ],
    sampleTranscript: 'In my view, the impact of tourism on local cultures is a double-edged sword. On the positive side, tourism injects vital capital into local economies, which often provides the financial resources necessary to preserve historical landmarks and fund cultural museums. Furthermore, it fosters profound cross-cultural empathy, breaking down xenophobic barriers as visitors and locals interact. \n\nHowever, on the negative side, unchecked tourism can precipitate cultural homogenization. Quite often, unique traditions are commercialized and watered down into superficial performances to cater to tourist expectations, stripping them of their sacred significance. Additionally, the influx of wealthy travelers can drive up the cost of living, marginalizing the local population. Therefore, to safeguard cultural heritage, it is absolutely essential that governments implement sustainable, ethical tourism frameworks.'
  },
  {
    id: 'ielts-s-p3-3',
    part: 3,
    title: 'Digital Communication Dynamics',
    prompt: 'How has modern technology changed the way people communicate with one another?',
    outline: [
      'Acknowledge the revolutionary impact: technology has dissolved physical borders.',
      'Discuss positive change: instantaneous correspondence across the globe, facilitating international collaboration.',
      'Discuss negative side: eroding face-to-face interpersonal skills and fostering a state of hyper-connected isolation.',
      'Conclude: we must balance virtual communication with real-world interactions.'
    ],
    lexicalUpgrades: [
      {
        basic: 'makes it fast',
        upgrade: 'facilitates instantaneous, real-time correspondence',
        meaning: 'tạo điều kiện cho việc trao đổi thông tin tức thời'
      },
      {
        basic: 'bad social skills',
        upgrade: 'erodes organic face-to-face interpersonal skills',
        meaning: 'bào mòn kỹ năng giao tiếp trực diện tự nhiên'
      },
      {
        basic: 'connected but lonely',
        upgrade: 'fosters a state of hyper-connected isolation',
        meaning: 'gây ra tình trạng cô lập giữa thế giới siêu kết nối'
      },
      {
        basic: 'big change',
        upgrade: 'precipitated a paradigm shift in human socialization',
        meaning: 'tạo ra một bước chuyển mình mang tính bước ngoặt trong cách con người xã hội hóa'
      }
    ],
    sampleTranscript: 'Modern technology has undeniably precipitated a paradigm shift in human socialization. The most obvious positive change is that it dissolves geographical boundaries, facilitating instantaneous, real-time correspondence across the globe. We can now collaborate with colleagues and maintain relationships with relatives across different continents with the touch of a button. \n\nNonetheless, this transformation has a darker side. Over-reliance on messaging apps and social media platforms often erodes organic face-to-face interpersonal skills, as people struggle to read subtle non-verbal cues. Paradoxically, while we are more connected than ever, technology fosters a state of hyper-connected isolation, where superficial digital interactions replace meaningful, high-quality human bonds. Therefore, we must remain mindful of balancing our digital lives with genuine physical connections.'
  }
];
