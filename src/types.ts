export type WorkBlockType = 
  | 'deep-work' 
  | 'shallow-work' 
  | 'meeting' 
  | 'break' 
  | 'kickoff' 
  | 'shutdown';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface WorkBlock {
  id: string;
  title: string;
  type: WorkBlockType;
  startTime: string; // "HH:MM" (24h)
  endTime: string;   // "HH:MM" (24h)
  durationMinutes: number;
  description?: string;
  tasks: SubTask[];
  completed: boolean;
  actualElapsedSeconds?: number;
  energyLevel?: 'high' | 'medium' | 'low';
}

export interface DayConfig {
  date: string;
  workStartTime: string;
  workEndTime: string;
  lunchStartTime: string;
  lunchDurationMinutes: number;
  targetDeepWorkHours: number;
  pacingStyle: 'maker' | 'ultradian' | 'pomodoro' | 'balanced';
}

export interface DistractionNote {
  id: string;
  text: string;
  timestamp: string;
  resolved: boolean;
}

export interface DayStats {
  totalScheduledMinutes: number;
  completedMinutes: number;
  deepWorkScheduledMinutes: number;
  deepWorkCompletedMinutes: number;
  blocksCompleted: number;
  totalBlocks: number;
  distractionsCaptured: number;
}

export interface DayScheduleTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  pacingStyle: DayConfig['pacingStyle'];
  blocks: Omit<WorkBlock, 'id' | 'completed' | 'actualElapsedSeconds'>[];
}
