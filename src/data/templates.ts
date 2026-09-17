import { DayScheduleTemplate } from '../types';

export const DAY_TEMPLATES: DayScheduleTemplate[] = [
  {
    id: 'balanced-flow',
    name: 'Balanced Flow (Recommended)',
    tagline: 'Optimal cognitive pacing with morning deep work and afternoon execution',
    description: 'Starts with a brief kickoff to set intentions, protects prime morning brainpower for deep work, dedicates early afternoon to collaboration & admin, and closes with a clean shutdown.',
    pacingStyle: 'balanced',
    blocks: [
      {
        title: 'Morning Kickoff & Orientation',
        type: 'kickoff',
        startTime: '09:00',
        endTime: '09:25',
        durationMinutes: 25,
        energyLevel: 'medium',
        description: 'Review top 3 outcomes for the day, check calendar, silence notifications.',
        tasks: [
          { id: 'k1', title: 'Define top 3 must-win outcomes', completed: false },
          { id: 'k2', title: 'Review today’s meeting calendar', completed: false },
          { id: 'k3', title: 'Close unnecessary browser tabs & turn on focus mode', completed: false }
        ]
      },
      {
        title: 'Deep Work Session 1: Core Priority',
        type: 'deep-work',
        startTime: '09:30',
        endTime: '11:15',
        durationMinutes: 105,
        energyLevel: 'high',
        description: 'Tackle the hardest, most cognitively demanding task while will-power is at its peak.',
        tasks: [
          { id: 'dw1', title: 'Complete primary draft/code/design deliverable', completed: false },
          { id: 'dw2', title: 'Zero external distractions (no email or messaging)', completed: false }
        ]
      },
      {
        title: 'Restorative Refresh & Hydration',
        type: 'break',
        startTime: '11:15',
        endTime: '11:30',
        durationMinutes: 15,
        energyLevel: 'low',
        description: 'Step away from screen, drink water, stretch, rest eyes.',
        tasks: [
          { id: 'b1', title: 'Physical stretch or short walk away from desk', completed: false }
        ]
      },
      {
        title: 'Admin & Async Communications (Batch 1)',
        type: 'shallow-work',
        startTime: '11:30',
        endTime: '12:15',
        durationMinutes: 45,
        energyLevel: 'medium',
        description: 'Batch process emails, Slack/Teams replies, and quick operational tasks.',
        tasks: [
          { id: 'sw1', title: 'Process priority inbox messages', completed: false },
          { id: 'sw2', title: 'Unblock teammates on pending requests', completed: false }
        ]
      },
      {
        title: 'Lunch & Cognitive Reset',
        type: 'break',
        startTime: '12:15',
        endTime: '13:00',
        durationMinutes: 45,
        energyLevel: 'low',
        description: 'Nutritious lunch, step outside or get natural light, disconnect completely.',
        tasks: [
          { id: 'l1', title: 'Enjoy lunch away from work screens', completed: false }
        ]
      },
      {
        title: 'Meetings & Collaboration Zone',
        type: 'meeting',
        startTime: '13:00',
        endTime: '14:30',
        durationMinutes: 90,
        energyLevel: 'medium',
        description: 'Time reserved for syncs, team discussions, 1-on-1s, or client calls.',
        tasks: [
          { id: 'm1', title: 'Attend scheduled team syncs & take action notes', completed: false }
        ]
      },
      {
        title: 'Micro-Break & Re-energize',
        type: 'break',
        startTime: '14:30',
        endTime: '14:45',
        durationMinutes: 15,
        energyLevel: 'low',
        description: 'Breathe, quick tea or coffee, reset posture.',
        tasks: []
      },
      {
        title: 'Deep Work Session 2: Implementation',
        type: 'deep-work',
        startTime: '14:45',
        endTime: '16:30',
        durationMinutes: 105,
        energyLevel: 'high',
        description: 'Focused sprint on secondary priority or finishing today’s key project work.',
        tasks: [
          { id: 'dw3', title: 'Finalize secondary task or review pull requests', completed: false }
        ]
      },
      {
        title: 'Daily Shutdown & Tomorrow Prep',
        type: 'shutdown',
        startTime: '16:30',
        endTime: '17:00',
        durationMinutes: 30,
        energyLevel: 'medium',
        description: 'Log accomplishments, clear temporary files, write tomorrow’s starting task.',
        tasks: [
          { id: 'sd1', title: 'Review completed tasks and celebrate progress', completed: false },
          { id: 'sd2', title: 'Draft tomorrow’s top 3 intentions', completed: false },
          { id: 'sd3', title: 'Close applications and conclude the workday', completed: false }
        ]
      }
    ]
  },
  {
    id: 'maker-deep-focus',
    name: 'Maker’s Deep Focus',
    tagline: 'Maximized uninterrupted blocks for engineers, writers, and designers',
    description: 'Minimizes context switching with massive morning and afternoon focus zones. Shallow tasks are compressed into a single afternoon hour.',
    pacingStyle: 'maker',
    blocks: [
      {
        title: 'Focus Warmup & Day Blueprint',
        type: 'kickoff',
        startTime: '09:00',
        endTime: '09:20',
        durationMinutes: 20,
        energyLevel: 'medium',
        description: 'Clear the mental runway, establish today’s single deep-work goal.',
        tasks: [
          { id: 'm-k1', title: 'Review project objective & spec requirements', completed: false }
        ]
      },
      {
        title: 'Deep Work Block A: Unbroken Creative Flow',
        type: 'deep-work',
        startTime: '09:20',
        endTime: '12:00',
        durationMinutes: 160,
        energyLevel: 'high',
        description: 'Deep, uninterrupted immersion. No notifications or meetings allowed.',
        tasks: [
          { id: 'm-dw1', title: 'Main architectural implementation or creative draft', completed: false }
        ]
      },
      {
        title: 'Lunch & Fresh Air',
        type: 'break',
        startTime: '12:00',
        endTime: '12:50',
        durationMinutes: 50,
        energyLevel: 'low',
        description: 'Complete mental disconnect to restore neurochemical focus reserves.',
        tasks: []
      },
      {
        title: 'Shallow Work & Triage Hour',
        type: 'shallow-work',
        startTime: '12:50',
        endTime: '13:50',
        durationMinutes: 60,
        energyLevel: 'medium',
        description: 'Rapid-fire email, Slack catchup, code reviews, and administrative duties.',
        tasks: [
          { id: 'm-sw1', title: 'Inbox zero and team unblocking', completed: false }
        ]
      },
      {
        title: 'Deep Work Block B: Build & Polish',
        type: 'deep-work',
        startTime: '14:00',
        endTime: '16:30',
        durationMinutes: 150,
        energyLevel: 'high',
        description: 'Second deep block for testing, refinement, or deep problem solving.',
        tasks: [
          { id: 'm-dw2', title: 'Run test suite, polish details, document progress', completed: false }
        ]
      },
      {
        title: 'Workday Shutdown Ritual',
        type: 'shutdown',
        startTime: '16:30',
        endTime: '17:00',
        durationMinutes: 30,
        energyLevel: 'low',
        description: 'Save git branches, write state notes for easy resume tomorrow morning.',
        tasks: [
          { id: 'm-sd1', title: 'Document resume point for tomorrow', completed: false }
        ]
      }
    ]
  },
  {
    id: 'ultradian-rhythm',
    name: '90-Min Ultradian Rhythm',
    tagline: 'Synchronized with human natural 90-minute biological attention cycles',
    description: 'Alternates 90-minute high-output focus sprints with mandatory 20-minute active recovery periods to sustain peak energy all day without burnout.',
    pacingStyle: 'ultradian',
    blocks: [
      {
        title: 'Cycle 1: Kickoff & Focus Sprint',
        type: 'deep-work',
        startTime: '09:00',
        endTime: '10:30',
        durationMinutes: 90,
        energyLevel: 'high',
        description: 'First biological energy peak: 15m planning followed by 75m high focus.',
        tasks: [
          { id: 'u1', title: 'Morning plan & top priority task', completed: false }
        ]
      },
      {
        title: 'Recovery Wave 1',
        type: 'break',
        startTime: '10:30',
        endTime: '10:50',
        durationMinutes: 20,
        energyLevel: 'low',
        description: 'Active rest: hydrate, walking meditation or eye relaxation.',
        tasks: []
      },
      {
        title: 'Cycle 2: Deep Sprint 2',
        type: 'deep-work',
        startTime: '10:50',
        endTime: '12:20',
        durationMinutes: 90,
        energyLevel: 'high',
        description: 'Second wave of rigorous cognitive output.',
        tasks: [
          { id: 'u2', title: 'Execute key analytical or development workload', completed: false }
        ]
      },
      {
        title: 'Midday Meal & Long Recovery',
        type: 'break',
        startTime: '12:20',
        endTime: '13:10',
        durationMinutes: 50,
        energyLevel: 'low',
        description: 'Satiating meal and nervous system down-regulation.',
        tasks: []
      },
      {
        title: 'Cycle 3: Collaborative / Admin Wave',
        type: 'shallow-work',
        startTime: '13:10',
        endTime: '14:40',
        durationMinutes: 90,
        energyLevel: 'medium',
        description: 'Team communications, reviews, discussions, and correspondence.',
        tasks: [
          { id: 'u3', title: 'Clear messaging queue, feedback sessions', completed: false }
        ]
      },
      {
        title: 'Recovery Wave 3',
        type: 'break',
        startTime: '14:40',
        endTime: '15:00',
        durationMinutes: 20,
        energyLevel: 'low',
        description: 'Fresh air, stretch, light tea.',
        tasks: []
      },
      {
        title: 'Cycle 4: Final Sprint & Daily Close',
        type: 'deep-work',
        startTime: '15:00',
        endTime: '16:30',
        durationMinutes: 90,
        energyLevel: 'medium',
        description: 'Tying loose ends, finalizing output, closing the day cleanly.',
        tasks: [
          { id: 'u4', title: 'Wrap up pending deliverables', completed: false }
        ]
      },
      {
        title: 'Shutdown & Disconnect',
        type: 'shutdown',
        startTime: '16:30',
        endTime: '17:00',
        durationMinutes: 30,
        energyLevel: 'low',
        description: 'Daily review, desk clearing, and complete mental disengagement.',
        tasks: [
          { id: 'u-sd', title: 'Formal work shutdown declaration', completed: false }
        ]
      }
    ]
  },
  {
    id: 'pomodoro-sprints',
    name: 'Pomodoro Execution Cadence',
    tagline: 'High-momentum 25-minute sprints designed to defeat procrastination',
    description: 'Divides the day into rapid, structured Pomodoro sets with tactical 5-minute pauses and longer breaks between sets.',
    pacingStyle: 'pomodoro',
    blocks: [
      {
        title: 'Day Kickoff & Sprint Mapping',
        type: 'kickoff',
        startTime: '09:00',
        endTime: '09:30',
        durationMinutes: 30,
        energyLevel: 'medium',
        description: 'Break down daily tasks into 25-minute bite-sized increments.',
        tasks: [
          { id: 'p-k1', title: 'Break today’s big project into 4 sprint goals', completed: false }
        ]
      },
      {
        title: 'Pomodoro Set A (Focus Sprints)',
        type: 'deep-work',
        startTime: '09:30',
        endTime: '11:10',
        durationMinutes: 100,
        energyLevel: 'high',
        description: '3 consecutive Pomodoro sprints with rapid micro-rests.',
        tasks: [
          { id: 'p-dw1', title: 'Sprint 1: Research & Outline (25m)', completed: false },
          { id: 'p-dw2', title: 'Sprint 2: Core Drafting / Coding (25m)', completed: false },
          { id: 'p-dw3', title: 'Sprint 3: Refinement & Validation (25m)', completed: false }
        ]
      },
      {
        title: 'Mid-Morning Recharge',
        type: 'break',
        startTime: '11:10',
        endTime: '11:30',
        durationMinutes: 20,
        energyLevel: 'low',
        description: '20-minute restorative pause after intense sprints.',
        tasks: []
      },
      {
        title: 'Admin & Communications Sprint',
        type: 'shallow-work',
        startTime: '11:30',
        endTime: '12:30',
        durationMinutes: 60,
        energyLevel: 'medium',
        description: 'Clear inboxes, quick follow-ups, urgent tickets.',
        tasks: [
          { id: 'p-sw1', title: 'Clear high-priority messages and requests', completed: false }
        ]
      },
      {
        title: 'Lunch Break',
        type: 'break',
        startTime: '12:30',
        endTime: '13:15',
        durationMinutes: 45,
        energyLevel: 'low',
        description: 'Healthy refuel and walk.',
        tasks: []
      },
      {
        title: 'Pomodoro Set B (Execution & Review)',
        type: 'deep-work',
        startTime: '13:15',
        endTime: '15:15',
        durationMinutes: 120,
        energyLevel: 'high',
        description: '4 tactical 25-minute sprints targeting secondary goals.',
        tasks: [
          { id: 'p-dw4', title: 'Sprint 4: Secondary objective execution (25m)', completed: false },
          { id: 'p-dw5', title: 'Sprint 5: Testing & QA checks (25m)', completed: false },
          { id: 'p-dw6', title: 'Sprint 6: Polish and packaging (25m)', completed: false }
        ]
      },
      {
        title: 'Collaboration & Meetings Window',
        type: 'meeting',
        startTime: '15:15',
        endTime: '16:30',
        durationMinutes: 75,
        energyLevel: 'medium',
        description: 'Team conversations, syncs, reviews.',
        tasks: []
      },
      {
        title: 'Shutdown & Clean Slate',
        type: 'shutdown',
        startTime: '16:30',
        endTime: '17:00',
        durationMinutes: 30,
        energyLevel: 'low',
        description: 'Tally completed Pomodoro counts, reset workspace.',
        tasks: [
          { id: 'p-sd1', title: 'Log total completed focus sprints', completed: false }
        ]
      }
    ]
  }
];
