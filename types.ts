
export type QuizDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface VocabularyItem {
  word: string;
  emoji: string;
  ipa: string;
  meaning: string;
  example: string;
  sentenceMeaning: string;
  type: string;
}

export interface GrammarSection {
  topic: string;
  explanation: string;
  examples: string[];
}

export interface ListeningQ {
  id: string;
  audioText: string; 
  options: string[]; 
  correctAnswer: number; 
  explanation: string;
}

export interface MultipleChoiceQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface SpeakingQ {
  id: string;
  question: string;
  suggestedAnswer: string;
}

export interface ScrambleQ {
  id: string;
  scrambled: string[];
  correctSentence: string;
  translation: string;
}

export interface FillInputQ {
  id: string;
  question: string;
  correctAnswer: string;
  clueEmoji: string;
}

export interface ErrorIdQ {
  id: string;
  sentence: string;
  options: string[]; 
  correctOptionIndex: number;
  explanation: string;
}

export interface MatchingPair {
  id: string;
  left: string; 
  right: string; 
}

export interface ReadingAdventure {
  title: string;
  passage: string;
  translation: string;
  comprehension: MultipleChoiceQ[];
}

export interface HomeworkTask {
  title: string;
  description: string;
  instructions: string;
}

export interface PracticeContent {
  listening: ListeningQ[]; 
  megaTest: {
    multipleChoice: MultipleChoiceQ[]; 
    scramble: ScrambleQ[]; 
    fillBlank: FillInputQ[]; 
    errorId: ErrorIdQ[]; 
    matching: MatchingPair[]; 
  };
}

export interface LessonPlan {
  topic: string;
  vocabulary: VocabularyItem[];
  grammar: GrammarSection;
  reading: ReadingAdventure;
  homework: HomeworkTask;
  practice: PracticeContent;
  teacherTips: string;
}

export enum AppMode {
  ANALYSIS = 'analysis',
  CREATIVE = 'creative'
}

export interface MindMapData {
  center: {
    title_en: string;
    title_vi: string;
    emoji?: string; 
  };
  nodes: Array<{
    text_en: string;
    text_vi: string;
    emoji?: string;
    color?: string;
  }>;
}

export enum MindMapMode {
  TOPIC = 'TOPIC',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE'
}

export interface FillBlankQuestion {
  sentence: string;
  answer: string;
  options: string[];
  explanation?: string;
}

export interface ContentResult {
  storyEnglish: string;
  translatedText: string;
  writingPromptEn: string;
  writingPromptVi: string;
  vocabulary: VocabularyItem[];
  imagePrompt: string;
  comprehensionQuestions: MultipleChoiceQ[];
  speakingQuestions: SpeakingQ[];
}

export interface PresentationScript {
  introduction: { english: string; vietnamese: string; };
  body: Array<{ keyword: string; script: string; }>;
  conclusion: { english: string; vietnamese: string; };
}

export interface SpeechEvaluation {
  scores: {
    pronunciation: number;
  };
  overallScore: number;
  feedback: string;
}

export enum LoadingStep {
  IDLE = 'Idle',
  ANALYZING = 'Analyzing content...',
  GENERATING_IMAGE = 'Generating magic image...',
  GENERATING_AUDIO = 'Creating Mrs. Dung\'s voice...',
  COMPLETED = 'Completed!'
}

export interface CharacterProfile {
  id: string;
  name: string;
  emoji: string;
  promptContext: string;
  stylePrompt: string;
  colorClass: string;
}

export type ImageRatio = '1:1' | '16:9' | '9:16';

export interface AppState {
  selectedCharacter: CharacterProfile;
  selectedMode: AppMode;
  selectedRatio: ImageRatio;
  customPrompt: string;
  originalImages: string[];
  generatedImage: string | null;
  audioUrl: string | null;
  contentResult: ContentResult | null;
  isLoading: boolean;
  loadingStep: LoadingStep;
  error: string | null;
}
