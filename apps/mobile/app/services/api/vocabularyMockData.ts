import type {
  FillInGapQuestion,
  MatchSynonymsQuestion,
  PerfectionQuestion,
  PerfectionRule,
  PracticeQuestion,
  PracticeTileData,
  RushQuestion,
  RushRule,
  SprintQuestion,
  SprintRule,
  VocabularyEntry,
} from "./vocabularyTypes"

export const vocabularyShowroomEntries: VocabularyEntry[] = [
  {
    id: "resile",
    word: "resile",
    pronunciation: "ri-sile",
    partOfSpeech: "v.",
    definition: "to bounce back to the original state",
    example: "The rubber band can resile easily.",
    examples: [
      "The rubber band can resile easily.",
      "Markets sometimes resile after a sudden shock.",
    ],
  },
  {
    id: "laconic",
    word: "laconic",
    pronunciation: "la-kon-ik",
    partOfSpeech: "adj.",
    definition: "using very few words",
    example: "Her laconic reply made the room go quiet.",
    examples: [
      "Her laconic reply made the room go quiet.",
      "He gave a laconic update in two sentences.",
    ],
  },
  {
    id: "verdant",
    word: "verdant",
    pronunciation: "ver-dant",
    partOfSpeech: "adj.",
    definition: "green with fresh growth",
    example: "After the rain, the valley looked verdant again.",
    examples: [
      "After the rain, the valley looked verdant again.",
      "A verdant hillside framed the town.",
    ],
  },
  {
    id: "lucid",
    word: "lucid",
    pronunciation: "loo-sid",
    partOfSpeech: "adj.",
    definition: "clear and easy to understand",
    example: "The guide gave a lucid explanation of the steps.",
    examples: [
      "The guide gave a lucid explanation of the steps.",
      "She kept a lucid focus through the long night.",
    ],
  },
  {
    id: "serene",
    word: "serene",
    pronunciation: "se-reen",
    partOfSpeech: "adj.",
    definition: "calm, peaceful, and untroubled",
    example: "The lake was serene at sunrise.",
    examples: [
      "The lake was serene at sunrise.",
      "He kept a serene tone during the meeting.",
    ],
  },
]

export const practiceTiles: PracticeTileData[] = [
  {
    id: "synonyms",
    label: "Match synonyms",
    icon: "view",
    accent: "#9BC9C6",
    accentSoft: "rgba(155, 201, 198, 0.18)",
  },
  {
    id: "guess",
    label: "Guess the word",
    icon: "community",
    accent: "#E7B586",
    accentSoft: "rgba(231, 181, 134, 0.18)",
  },
  {
    id: "fill",
    label: "Fill in the gap",
    icon: "components",
    accent: "#A9C6E8",
    accentSoft: "rgba(169, 198, 232, 0.18)",
  },
  {
    id: "meaning",
    label: "Meaning match",
    icon: "check",
    accent: "#D6C48A",
    accentSoft: "rgba(214, 196, 138, 0.18)",
  },
]

export const challengeTiles: PracticeTileData[] = [
  {
    id: "rush",
    label: "Rush",
    icon: "clap",
    accent: "#EAA0A0",
    accentSoft: "rgba(234, 160, 160, 0.18)",
  },
  {
    id: "sprint",
    label: "Sprint",
    icon: "podcast",
    accent: "#A6D7A8",
    accentSoft: "rgba(166, 215, 168, 0.18)",
  },
  {
    id: "perfection",
    label: "Perfection",
    icon: "heart",
    accent: "#E8B0CC",
    accentSoft: "rgba(232, 176, 204, 0.18)",
  },
]

export const meaningMatchQuestions: PracticeQuestion[] = [
  {
    id: "q1",
    prompt: "A website that allows collaborative editing.",
    answers: [
      { id: "automaton", label: "automaton" },
      { id: "imbedding", label: "imbedding" },
      { id: "wiki", label: "wiki" },
    ],
    correctId: "wiki",
    example: "She updated the wiki with new information.",
  },
  {
    id: "q2",
    prompt: "In a way that gives useful information",
    answers: [
      { id: "informatively", label: "informatively" },
      { id: "tardily", label: "tardily" },
      { id: "captivatingly", label: "captivatingly" },
    ],
    correctId: "informatively",
    example: "She spoke informatively about the new project.",
  },
  {
    id: "q3",
    prompt: "Can be extended or stretched out",
    answers: [
      { id: "extensible", label: "extensible" },
      { id: "complex", label: "complex" },
      { id: "resistive", label: "resistive" },
    ],
    correctId: "extensible",
    example: "The architecture is extensible for new features.",
  },
]

export const matchSynonymsQuestions: MatchSynonymsQuestion[] = [
  {
    id: "q1",
    prompt: "listen",
    answers: [
      { id: "harken", label: "harken" },
      { id: "connivery", label: "connivery" },
      { id: "indescribable", label: "indescribable" },
    ],
    correctId: "harken",
    definition: "(v.) Give attention to sound or listen carefully",
  },
  {
    id: "q2",
    prompt: "get the ball rolling",
    answers: [
      { id: "preponderate", label: "preponderate" },
      { id: "sentient", label: "sentient" },
      { id: "set-in-motion", label: "set in motion" },
    ],
    correctId: "set-in-motion",
    definition: "(v.) Start an activity or process",
  },
  {
    id: "q3",
    prompt: "shiver",
    answers: [
      { id: "shake", label: "shake" },
      { id: "inculcate", label: "inculcate" },
      { id: "remonstrate", label: "remonstrate" },
    ],
    correctId: "shake",
    definition: "(v.) Shake slightly, usually from cold or fear",
  },
]

export const fillInGapQuestions: FillInGapQuestion[] = [
  {
    id: "q1",
    prefix: "The ",
    placeholder: "__________",
    suffix: "s for the party looked amazing.",
    answers: [
      { id: "decoration", label: "decoration" },
      { id: "bathing", label: "bathing" },
      { id: "piece", label: "piece" },
    ],
    correctId: "decoration",
    definition: "(n.) ornaments or arrangements used to enhance something",
  },
  {
    id: "q2",
    prefix: "The park is ",
    placeholder: "__",
    suffix: " to the left.",
    answers: [
      { id: "playful", label: "playful" },
      { id: "quick", label: "quick" },
      { id: "off", label: "off" },
    ],
    correctId: "off",
    definition: "(adj.) Distant",
  },
  {
    id: "q3",
    prefix: "The lecture was so ",
    placeholder: "__________",
    suffix: " that everyone took notes.",
    answers: [
      { id: "informative", label: "informative" },
      { id: "forgetful", label: "forgetful" },
      { id: "flexible", label: "flexible" },
    ],
    correctId: "informative",
    definition: "(adj.) Providing useful information",
  },
]

export const sprintRules: SprintRule[] = [
  {
    id: "guess",
    icon: "view",
    label: "Guess the correct word",
  },
  {
    id: "streak",
    icon: "components",
    label: "Answer as many as you can",
  },
  {
    id: "time",
    icon: "bell",
    label: "60 seconds total",
  },
]

export const sprintQuestions: SprintQuestion[] = [
  {
    id: "q1",
    prompt: "A way to leave a place",
    answers: [
      { id: "exit", label: "exit" },
      { id: "foreigner", label: "foreigner" },
      { id: "arrival", label: "arrival" },
    ],
    correctId: "exit",
  },
  {
    id: "q2",
    prompt: "Soft, lumpy white cheese made from skimmed milk curds",
    answers: [
      { id: "cottage-cheese", label: "cottage cheese" },
      { id: "swiss-cheese", label: "swiss cheese" },
      { id: "melon", label: "melon" },
    ],
    correctId: "cottage-cheese",
  },
  {
    id: "q3",
    prompt: "Attract someone's attention",
    answers: [
      { id: "catch-eye", label: "catch someone's eye" },
      { id: "beat-around", label: "beat around the bush" },
      { id: "wake-up", label: "wake up and smell the coffee" },
    ],
    correctId: "catch-eye",
  },
  {
    id: "q4",
    prompt: "A place where information can be edited collaboratively",
    answers: [
      { id: "catalog", label: "catalog" },
      { id: "wiki", label: "wiki" },
      { id: "glossary", label: "glossary" },
    ],
    correctId: "wiki",
  },
]

export const rushRules: RushRule[] = [
  {
    id: "guess",
    icon: "view",
    label: "Guess the correct word",
  },
  {
    id: "streak",
    icon: "components",
    label: "Answer as many as you can",
  },
  {
    id: "lives",
    icon: "heart",
    label: "3 lives total",
  },
  {
    id: "time",
    icon: "bell",
    label: "5 seconds per question",
  },
]

export const rushQuestions: RushQuestion[] = [
  {
    id: "q1",
    prompt:
      "A type of hormone produced in the body that reduces pain, especially when you are injured or physically tired",
    answers: [
      { id: "endorphin", label: "endorphin" },
      { id: "gizmo", label: "gizmo" },
      { id: "sanitaria", label: "sanitaria" },
    ],
    correctId: "endorphin",
  },
  {
    id: "q2",
    prompt: "A place where information can be edited collaboratively",
    answers: [
      { id: "catalog", label: "catalog" },
      { id: "wiki", label: "wiki" },
      { id: "glossary", label: "glossary" },
    ],
    correctId: "wiki",
  },
  {
    id: "q3",
    prompt: "Able to be extended or expanded easily",
    answers: [
      { id: "resistive", label: "resistive" },
      { id: "extensible", label: "extensible" },
      { id: "opaque", label: "opaque" },
    ],
    correctId: "extensible",
  },
]

export const perfectionRules: PerfectionRule[] = [
  {
    id: "guess",
    icon: "view",
    label: "Guess the correct word",
  },
  {
    id: "streak",
    icon: "components",
    label: "Answer as many as you can",
  },
  {
    id: "lives",
    icon: "heart",
    label: "3 lives total",
  },
  {
    id: "time",
    icon: "bell",
    label: "No time limits or timers",
  },
]

export const perfectionQuestions: PerfectionQuestion[] = [
  {
    id: "q1",
    prompt: "A person who helps you shop in stores",
    answers: [
      { id: "option", label: "option" },
      { id: "salesclerk", label: "salesclerk" },
      { id: "pension", label: "pension" },
    ],
    correctId: "salesclerk",
  },
  {
    id: "q2",
    prompt: "A process in which one or more substances are converted into other substances",
    answers: [
      { id: "reaction", label: "reaction" },
      { id: "gizmo", label: "gizmo" },
      { id: "fish", label: "fish" },
    ],
    correctId: "reaction",
  },
  {
    id: "q3",
    prompt: "A place where information can be edited collaboratively",
    answers: [
      { id: "catalog", label: "catalog" },
      { id: "wiki", label: "wiki" },
      { id: "glossary", label: "glossary" },
    ],
    correctId: "wiki",
  },
]
