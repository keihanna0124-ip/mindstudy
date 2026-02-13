
export interface StudyProfile {
  grade: string;
  strengths: string;
  weaknesses: string;
  challenges: string;
  goals: string;
  focusTime: string; 
  sleepDuration: string;
}

export interface QuizResult {
  focusLevel: string;
  stamina: string;
  style: string;
}

export interface MindMapNode {
  title: string;
  content: string;
}

export interface StudyPlan {
  roadmap: MindMapNode[];
  summary: string;
  advice: string;
  motivationalQuote: string;
}

export interface RelaxActivity {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface LearningProgress {
  id: string;
  subject: string;
  date: string;
  score: number;
  icon: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  setName: string;
}

export interface Reminder {
  id: string;
  task: string;
  time: string;
  frequency: 'Daily' | 'Weekly' | 'Once';
  isActive: boolean;
  color: string;
}
