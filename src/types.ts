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
  // Corporate Meeting Deflector & Cost metrics
  attendeesCount?: number;
  hourlyRateAvg?: number;
  meetingCost?: number;
  isDeflectedToAsync?: boolean;
  asyncMemo?: string;
  isCompressed?: boolean;
}

export type Chronotype = 'lion' | 'bear' | 'wolf';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: 'Executive' | 'Engineering' | 'Product & Design' | 'Revenue & Growth';
  timezone: string;
  city: string;
  status: 'deep-focus' | 'in-meeting' | 'available' | 'recharge';
  currentFocus: string;
  untilTime: string;
  shieldActive: boolean;
  focusScore: number;
}

export type SoundscapeMode = 'none' | 'binaural-theta' | 'olympus-storm' | 'executive-brown';

export interface DayConfig {
  date: string;
  workStartTime: string;
  workEndTime: string;
  lunchStartTime: string;
  lunchDurationMinutes: number;
  targetDeepWorkHours: number;
  pacingStyle: 'maker' | 'ultradian' | 'pomodoro' | 'balanced';
  chronotype: Chronotype;
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
  totalMeetingMinutes: number;
  totalMeetingCost: number;
  savedMeetingCost: number;
  fragmentationScore: number; // 0 - 100%
}

export interface DayScheduleTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  pacingStyle: DayConfig['pacingStyle'];
  blocks: Omit<WorkBlock, 'id' | 'completed' | 'actualElapsedSeconds'>[];
}

export interface EnterpriseRoiConfig {
  companySize: number;
  avgExecutiveSalary: number;
  wastedHoursPerWeek: number;
  deflectionTargetPct: number;
}

