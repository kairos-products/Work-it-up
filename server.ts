import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

// Initialize Gemini SDK with telemetry header if key is available
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Day Structuring Endpoint
app.post('/api/ai/structure-day', async (req, res) => {
  try {
    const {
      priorities = '',
      meetings = '',
      workStartTime = '09:00',
      workEndTime = '17:30',
      lunchStartTime = '12:30',
      lunchDurationMinutes = 45,
      pacingStyle = 'balanced',
      energyPreference = 'morning-focus',
    } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are an elite executive productivity architect and chronological workday planner.
Structure an exceptional, realistic, and cognitively optimized workday schedule based on the user's constraints:
- Workday Start Time: ${workStartTime}
- Workday End Time: ${workEndTime}
- Target Lunch Start Time: ${lunchStartTime} (${lunchDurationMinutes} mins)
- Pacing Preference: ${pacingStyle} (maker, ultradian, pomodoro, or balanced)
- Energy Peak: ${energyPreference}
- User's Priorities & Task Dump: "${priorities || 'Complete high priority project deliverable, clear inbox, prepare for tomorrow'}"
- Fixed Meetings / Inflexible Commitments: "${meetings || 'None specified'}"

CRITICAL RULES FOR WORKDAY STRUCTURING:
1. Cover the entire window from ${workStartTime} to ${workEndTime} seamlessly without unexplained dead zones or overlapping times.
2. Start with a 15-25 min "kickoff" block for mental runway & daily orientation.
3. Reserve prime high-energy morning hours for "deep-work" (uninterrupted focus on the top priority).
4. If meetings are provided, honor those exact times with type="meeting".
5. Include lunch as type="break" around ${lunchStartTime} for ${lunchDurationMinutes} min.
6. Insert 10-20 min restorative breaks ("break") between heavy cognitive blocks.
7. Batch administrative tasks (email, messaging) into a dedicated "shallow-work" block, preferably early afternoon.
8. End with a 20-30 min "shutdown" block to log achievements, clear desk, and plan tomorrow.
9. For each block, provide 1 to 3 clear, actionable sub-tasks.
10. Valid types are: 'deep-work', 'shallow-work', 'meeting', 'break', 'kickoff', 'shutdown'.
11. Times must be 24-hour "HH:MM" format.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                scheduleName: { type: Type.STRING, description: 'Descriptive title for today’s schedule' },
                strategyExplanation: { type: Type.STRING, description: 'Why this pacing and block order will maximize focus' },
                productivityTip: { type: Type.STRING, description: '1 practical, tactical advice for executing this specific day' },
                blocks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      type: {
                        type: Type.STRING,
                        description: 'Must be deep-work, shallow-work, meeting, break, kickoff, or shutdown',
                      },
                      startTime: { type: Type.STRING, description: 'HH:MM in 24h format' },
                      endTime: { type: Type.STRING, description: 'HH:MM in 24h format' },
                      durationMinutes: { type: Type.INTEGER },
                      description: { type: Type.STRING },
                      energyLevel: { type: Type.STRING, description: 'high, medium, or low' },
                      tasks: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                          },
                          required: ['title'],
                        },
                      },
                    },
                    required: ['title', 'type', 'startTime', 'endTime', 'durationMinutes'],
                  },
                },
              },
              required: ['scheduleName', 'strategyExplanation', 'blocks', 'productivityTip'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.blocks && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
          // Format with IDs
          const formattedBlocks = parsed.blocks.map((block: any, index: number) => ({
            id: `block-${Date.now()}-${index}`,
            title: block.title,
            type: block.type || 'deep-work',
            startTime: block.startTime,
            endTime: block.endTime,
            durationMinutes: block.durationMinutes || 60,
            description: block.description || '',
            energyLevel: block.energyLevel || 'medium',
            completed: false,
            tasks: (block.tasks || []).map((t: any, tIdx: number) => ({
              id: `task-${Date.now()}-${index}-${tIdx}`,
              title: typeof t === 'string' ? t : t.title,
              completed: false,
            })),
          }));

          return res.json({
            scheduleName: parsed.scheduleName || 'Custom Structured Day',
            strategyExplanation: parsed.strategyExplanation || 'Tailored to your priorities with dedicated deep work cycles.',
            productivityTip: parsed.productivityTip || 'Protect your deep work blocks by closing unnecessary communication tabs.',
            blocks: formattedBlocks,
            source: 'gemini',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini day structure failed, falling back to algorithmic structure generator:', geminiError);
      }
    }

    // Algorithmic Fallback Generator (Guaranteed reliable, instant)
    const fallbackBlocks = generateAlgorithmicSchedule({
      priorities,
      meetings,
      workStartTime,
      workEndTime,
      lunchStartTime,
      lunchDurationMinutes,
      pacingStyle,
    });

    return res.json({
      scheduleName: `${pacingStyle.charAt(0).toUpperCase() + pacingStyle.slice(1)} Structure Day`,
      strategyExplanation: 'Protected deep focus periods scheduled for early hours, with administrative batching and structured breaks.',
      productivityTip: 'Single-task through each block without multitasking to maximize mental energy retention.',
      blocks: fallbackBlocks,
      source: 'algorithmic',
    });
  } catch (err: any) {
    console.error('Error structuring day:', err);
    res.status(500).json({ error: 'Failed to structure day', details: err.message });
  }
});

// AI Day Rebalancer Endpoint (when day is interrupted or behind)
app.post('/api/ai/rebalance-day', async (req, res) => {
  try {
    const { currentTime, remainingBlocks = [], completedBlocks = [], workEndTime = '17:30', note = '' } = req.body;
    const ai = getGeminiClient();

    if (ai && remainingBlocks.length > 0) {
      try {
        const prompt = `The user is currently structuring their workday at ${currentTime}.
Their planned work day ends at ${workEndTime}.
They need to rebalance their REMAINING schedule because things shifted or ran over.
User note: "${note || 'Running behind schedule, need realistic pacing to still finish primary goals.'}"

Already Completed Blocks:
${completedBlocks.map((b: any) => `- [DONE] ${b.title} (${b.startTime}-${b.endTime})`).join('\n') || 'None'}

Remaining Planned Blocks:
${remainingBlocks.map((b: any) => `- ${b.title} (${b.type}, ${b.durationMinutes}m) [Tasks: ${(b.tasks || []).map((t: any) => t.title).join(', ')}]`).join('\n')}

INSTRUCTIONS:
1. Re-time and reorganize the remaining blocks to start at ${currentTime} and finish around ${workEndTime}.
2. If time is tight, trim low-priority shallow tasks or adjust duration, but preserve at least one high-impact focus block.
3. Ensure a 15-20 min shutdown block remains at the end of the day.
4. Output valid JSON matching the schema.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                rebalanceMessage: { type: Type.STRING, description: 'Reassuring summary of how the remaining day was adjusted' },
                adjustedBlocks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      type: { type: Type.STRING },
                      startTime: { type: Type.STRING },
                      endTime: { type: Type.STRING },
                      durationMinutes: { type: Type.INTEGER },
                      description: { type: Type.STRING },
                      energyLevel: { type: Type.STRING },
                      tasks: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                          },
                          required: ['title'],
                        },
                      },
                    },
                    required: ['title', 'type', 'startTime', 'endTime', 'durationMinutes'],
                  },
                },
              },
              required: ['rebalanceMessage', 'adjustedBlocks'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.adjustedBlocks && parsed.adjustedBlocks.length > 0) {
          const rebalanced = parsed.adjustedBlocks.map((block: any, idx: number) => ({
            id: `rebalanced-${Date.now()}-${idx}`,
            title: block.title,
            type: block.type || 'deep-work',
            startTime: block.startTime,
            endTime: block.endTime,
            durationMinutes: block.durationMinutes,
            description: block.description || '',
            energyLevel: block.energyLevel || 'medium',
            completed: false,
            tasks: (block.tasks || []).map((t: any, tIdx: number) => ({
              id: `rtask-${Date.now()}-${idx}-${tIdx}`,
              title: typeof t === 'string' ? t : t.title,
              completed: false,
            })),
          }));

          return res.json({
            rebalanceMessage: parsed.rebalanceMessage || 'Your remaining schedule has been adjusted gracefully.',
            blocks: rebalanced,
            source: 'gemini',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini rebalance fallback:', geminiError);
      }
    }

    // Fallback algorithmic shift: bump start times forward sequentially starting from currentTime
    const shifted = algorithmicTimeShift(remainingBlocks, currentTime, workEndTime);
    return res.json({
      rebalanceMessage: `Schedule timeline shifted forward to match current time (${currentTime}).`,
      blocks: shifted,
      source: 'algorithmic',
    });
  } catch (err: any) {
    console.error('Error rebalancing day:', err);
    res.status(500).json({ error: 'Failed to rebalance day', details: err.message });
  }
});

// AI Meeting Deflector to Async Executive Briefing
app.post('/api/ai/meeting-deflect', async (req, res) => {
  try {
    const {
      meetingTitle = 'Sync',
      attendeesCount = 4,
      durationMinutes = 45,
      agendaContext = '',
    } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are ZEUS ThunderShield™, an executive meeting elimination and asynchronous communication engine for corporate enterprises.
Convert the following meeting into an airtight, high-leverage Asynchronous Memo & Slack/Teams Briefing so the attendees do not have to sit on a call:
- Meeting Title: "${meetingTitle}"
- Planned Attendees: ${attendeesCount} participants
- Duration: ${durationMinutes} minutes
- Context / Agenda: "${agendaContext || 'General status alignment, review milestones, identify blockers'}"

Generate:
1. An executive summary of why this is handled asynchronously.
2. Structured bullet points for Progress / Updates.
3. Explicit Decision Points requiring sign-off (with clear ownership).
4. A polite, authoritative Slack/Teams message snippet ready to copy-paste.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                memoHeadline: { type: Type.STRING },
                executiveSummary: { type: Type.STRING },
                updates: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                decisionsNeeded: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                slackMessageSnippet: { type: Type.STRING },
              },
              required: ['memoHeadline', 'executiveSummary', 'updates', 'decisionsNeeded', 'slackMessageSnippet'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          memoHeadline: parsed.memoHeadline || `Async Briefing: ${meetingTitle}`,
          executiveSummary: parsed.executiveSummary || 'Replacing synchronous block with async decision register.',
          updates: parsed.updates || ['Deliverable milestones proceeding on schedule.', 'Dependencies mapped.'],
          decisionsNeeded: parsed.decisionsNeeded || ['Review document comments by 4:00 PM EST.', 'Confirm signoff.'],
          slackMessageSnippet: parsed.slackMessageSnippet || `⚡ ZEUS ThunderShield: Converting our ${durationMinutes}m sync on "${meetingTitle}" to an async brief to protect deep work. Please drop approvals below.`,
          source: 'gemini',
        });
      } catch (geminiError) {
        console.warn('Gemini deflect fallback:', geminiError);
      }
    }

    // Algorithmic Fallback
    return res.json({
      memoHeadline: `Executive Async Memo: ${meetingTitle}`,
      executiveSummary: `Deflected ${durationMinutes}m synchronous meeting to protect focus bandwidth. All stakeholders please review the action items below asynchronously.`,
      updates: [
        'Core objectives tracked and documented in project repository.',
        'No blocking architectural impediments detected for current sprint.',
      ],
      decisionsNeeded: [
        'Please review the attached briefing notes and react with :white_check_mark: to approve by EOD.',
        'If urgent escalation is needed, reach out in the designated VIP channel.',
      ],
      slackMessageSnippet: `⚡ [ZEUS Shield] Converting our "${meetingTitle}" (${durationMinutes}m, ${attendeesCount} participants) into an async update to reclaim focus. Please review and reply with your approvals.`,
      source: 'algorithmic',
    });
  } catch (err: any) {
    console.error('Error deflecting meeting:', err);
    res.status(500).json({ error: 'Failed to deflect meeting', details: err.message });
  }
});

// Helper for minutes to HH:MM and back
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function toHHMM(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, Math.round(totalMinutes)));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Algorithmic Fallback Schedule Builder
function generateAlgorithmicSchedule(params: {
  priorities: string;
  meetings: string;
  workStartTime: string;
  workEndTime: string;
  lunchStartTime: string;
  lunchDurationMinutes: number;
  pacingStyle: string;
}) {
  const startMin = toMinutes(params.workStartTime);
  const endMin = toMinutes(params.workEndTime);
  const lunchMin = toMinutes(params.lunchStartTime);
  const lunchDuration = Number(params.lunchDurationMinutes) || 45;

  const parsedPriorities = params.priorities
    ? params.priorities.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
    : ['High-impact core project deliverable', 'Code / Document review', 'Inbox zero'];

  const blocks: any[] = [];
  let cur = startMin;

  // 1. Kickoff
  const kickoffEnd = cur + 25;
  blocks.push({
    id: `blk-${Date.now()}-0`,
    title: 'Morning Kickoff & Alignment',
    type: 'kickoff',
    startTime: toHHMM(cur),
    endTime: toHHMM(kickoffEnd),
    durationMinutes: 25,
    energyLevel: 'medium',
    description: 'Set daily intentions, review today’s agenda, eliminate distractions.',
    tasks: [
      { id: `t-0`, title: 'Define top win for the day', completed: false },
      { id: `t-1`, title: 'Turn off notification pings', completed: false },
    ],
    completed: false,
  });
  cur = kickoffEnd;

  // 2. Morning Deep Work
  const morningDeepEnd = Math.min(lunchMin - 15, cur + 105);
  if (morningDeepEnd > cur) {
    blocks.push({
      id: `blk-${Date.now()}-1`,
      title: 'Deep Work Sprint 1: Primary Outcome',
      type: 'deep-work',
      startTime: toHHMM(cur),
      endTime: toHHMM(morningDeepEnd),
      durationMinutes: morningDeepEnd - cur,
      energyLevel: 'high',
      description: 'Single-minded focus on the most challenging task.',
      tasks: parsedPriorities.slice(0, 2).map((p, i) => ({
        id: `t-dw-${i}`,
        title: p,
        completed: false,
      })),
      completed: false,
    });
    cur = morningDeepEnd;
  }

  // 3. Morning Buffer / Micro break
  if (lunchMin > cur) {
    blocks.push({
      id: `blk-${Date.now()}-2`,
      title: 'Stretch & Hydration Pause',
      type: 'break',
      startTime: toHHMM(cur),
      endTime: toHHMM(lunchMin),
      durationMinutes: lunchMin - cur,
      energyLevel: 'low',
      description: 'Short walk, drink water, eye rest.',
      tasks: [],
      completed: false,
    });
    cur = lunchMin;
  }

  // 4. Lunch
  const lunchEnd = cur + lunchDuration;
  blocks.push({
    id: `blk-${Date.now()}-3`,
    title: 'Lunch & Cognitive Disconnect',
    type: 'break',
    startTime: toHHMM(cur),
    endTime: toHHMM(lunchEnd),
    durationMinutes: lunchDuration,
    energyLevel: 'low',
    description: 'Nourishing meal away from digital work screens.',
    tasks: [],
    completed: false,
  });
  cur = lunchEnd;

  // 5. Afternoon Collaboration or Meetings
  const collabDuration = 75;
  const collabEnd = Math.min(endMin - 60, cur + collabDuration);
  if (collabEnd > cur) {
    blocks.push({
      id: `blk-${Date.now()}-4`,
      title: params.meetings ? 'Meetings & Collaboration' : 'Admin & Communications Batch',
      type: params.meetings ? 'meeting' : 'shallow-work',
      startTime: toHHMM(cur),
      endTime: toHHMM(collabEnd),
      durationMinutes: collabEnd - cur,
      energyLevel: 'medium',
      description: 'Respond to urgent messages, team syncs, and administrative items.',
      tasks: [
        { id: `t-sw-0`, title: 'Process inbox and direct messages', completed: false },
        { id: `t-sw-1`, title: 'Clear quick pending approvals', completed: false },
      ],
      completed: false,
    });
    cur = collabEnd;
  }

  // 6. Deep Work Session 2
  const shutdownDuration = 30;
  const deep2End = Math.max(cur, endMin - shutdownDuration);
  if (deep2End - cur >= 30) {
    blocks.push({
      id: `blk-${Date.now()}-5`,
      title: 'Deep Work Sprint 2: Secondary Focus',
      type: 'deep-work',
      startTime: toHHMM(cur),
      endTime: toHHMM(deep2End),
      durationMinutes: deep2End - cur,
      energyLevel: 'high',
      description: 'Finalize core deliverable or solve secondary milestone.',
      tasks: [
        { id: `t-dw2-0`, title: parsedPriorities[2] || 'Advance secondary project goal', completed: false },
      ],
      completed: false,
    });
    cur = deep2End;
  }

  // 7. Workday Shutdown
  blocks.push({
    id: `blk-${Date.now()}-6`,
    title: 'Daily Shutdown & Tomorrow Prep',
    type: 'shutdown',
    startTime: toHHMM(cur),
    endTime: toHHMM(endMin),
    durationMinutes: Math.max(15, endMin - cur),
    energyLevel: 'low',
    description: 'Log progress, clear tabs, note tomorrow’s opening move, and disconnect.',
    tasks: [
      { id: `t-sd-0`, title: 'Review completed checklist', completed: false },
      { id: `t-sd-1`, title: 'Write down tomorrow’s #1 priority', completed: false },
    ],
    completed: false,
  });

  return blocks;
}

function algorithmicTimeShift(remainingBlocks: any[], currentTime: string, workEndTime: string) {
  let cur = Math.max(toMinutes(currentTime), 0);
  const endMin = toMinutes(workEndTime);
  const availableMinutes = Math.max(30, endMin - cur);

  // Total planned duration of remaining blocks
  const originalTotal = remainingBlocks.reduce((acc, b) => acc + (b.durationMinutes || 30), 0);
  const compressionRatio = originalTotal > availableMinutes ? availableMinutes / originalTotal : 1;

  return remainingBlocks.map((block, idx) => {
    const rawDur = Math.round((block.durationMinutes || 30) * compressionRatio);
    const duration = Math.max(15, rawDur);
    const start = cur;
    const end = Math.min(endMin, start + duration);
    cur = end;

    return {
      ...block,
      id: block.id || `shift-${Date.now()}-${idx}`,
      startTime: toHHMM(start),
      endTime: toHHMM(end),
      durationMinutes: Math.max(10, end - start),
    };
  });
}

// Start Server with Vite Middleware in dev or static dist in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Workday Structurer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
