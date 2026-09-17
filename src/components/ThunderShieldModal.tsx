import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  DollarSign, 
  Zap, 
  Clock, 
  FileText, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles,
  Users,
  Layers,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { WorkBlock } from '../types';

interface ThunderShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: WorkBlock[];
  onUpdateBlocks: (newBlocks: WorkBlock[]) => void;
  onBlockConverted: (blockId: string, asyncMemo: string) => void;
}

export const ThunderShieldModal: React.FC<ThunderShieldModalProps> = ({
  isOpen,
  onClose,
  blocks,
  onUpdateBlocks,
  onBlockConverted,
}) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [attendeesCount, setAttendeesCount] = useState<number>(5);
  const [hourlyRate, setHourlyRate] = useState<number>(140);
  const [agendaContext, setAgendaContext] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedMemo, setGeneratedMemo] = useState<{
    headline: string;
    summary: string;
    updates: string[];
    decisions: string[];
    slackSnippet: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const meetingBlocks = blocks.filter((b) => b.type === 'meeting');
  const activeMeeting = meetingBlocks.find((b) => b.id === selectedMeetingId) || meetingBlocks[0];

  // Calculate stats
  const totalMeetingMinutes = meetingBlocks.reduce((acc, m) => acc + m.durationMinutes, 0);
  const totalBurnCost = meetingBlocks.reduce((acc, m) => {
    const attendees = m.attendeesCount || 4;
    const rate = m.hourlyRateAvg || 140;
    return acc + Math.round((m.durationMinutes / 60) * attendees * rate);
  }, 0);

  // Calendar Fragmentation (Swiss cheese index): ratio of gaps between blocks or multiple isolated short meetings
  const fragmentationPct = Math.min(100, Math.round((meetingBlocks.length * 18) + (totalMeetingMinutes > 180 ? 25 : 10)));

  const handleDeflectMeeting = async () => {
    if (!activeMeeting) return;
    setIsGenerating(true);
    setGeneratedMemo(null);

    try {
      const res = await fetch('/api/ai/meeting-deflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingTitle: activeMeeting.title,
          attendeesCount: attendeesCount,
          durationMinutes: activeMeeting.durationMinutes,
          agendaContext: agendaContext || activeMeeting.description,
        }),
      });

      const data = await res.json();
      setGeneratedMemo({
        headline: data.memoHeadline,
        summary: data.executiveSummary,
        updates: data.updates || [],
        decisions: data.decisionsNeeded || [],
        slackSnippet: data.slackMessageSnippet,
      });

      // Update block to deep work and mark as deflected
      onBlockConverted(
        activeMeeting.id, 
        `Deflected from meeting "${activeMeeting.title}" to protected Deep Work block with async memo.`
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompressAllMeetings = () => {
    // Google/Microsoft speed meetings compression
    const updated = blocks.map((b) => {
      if (b.type === 'meeting' && !b.isCompressed) {
        let newDur = b.durationMinutes;
        if (b.durationMinutes >= 60) {
          newDur = 45; // 15m bio-break saved
        } else if (b.durationMinutes >= 30) {
          newDur = 25; // 5m bio-break saved
        }
        return {
          ...b,
          durationMinutes: newDur,
          isCompressed: true,
          description: (b.description ? b.description + ' • ' : '') + '⚡ Compressed by Zeus Speed-Meeting rule',
        };
      }
      return b;
    });
    onUpdateBlocks(updated);
  };

  const handleCopySlackSnippet = () => {
    if (generatedMemo) {
      navigator.clipboard.writeText(generatedMemo.slackSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>ZEUS ThunderShield™</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono tracking-wider uppercase border border-amber-500/30">
                  Corporate Deflector
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Eliminate calendar Swiss-cheese, audit meeting burn-rate & deflect to async
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Executive Metrics Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
                <span>Daily Meeting Burn</span>
                <Flame className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
                ${totalBurnCost.toLocaleString()}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {meetingBlocks.length} meetings • {totalMeetingMinutes} mins on call
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between text-stone-600 text-xs font-semibold">
                <span>Swiss-Cheese Index</span>
                <Layers className="w-4 h-4 text-stone-500" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-stone-900">
                  {fragmentationPct}%
                </span>
                <span className={`text-[11px] font-semibold ${fragmentationPct > 50 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {fragmentationPct > 50 ? 'Severe Fragmentation' : 'Optimal Focus'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Calendar context fragmentation level
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 text-white flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Speed-Meeting Condenser
                </div>
                <p className="text-[11px] text-stone-300 mt-1 leading-tight">
                  Auto-compress 60m → 45m and 30m → 25m to reclaim recovery buffers.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCompressAllMeetings}
                className="mt-3 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Apply 1-Click Speed Meetings
              </button>
            </div>

          </div>

          {/* Deflect a Meeting Section */}
          <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  AI Meeting-to-Async Deflector
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Turn an unnecessary sync into a structured async memo & reclaim your deep focus
                </p>
              </div>
            </div>

            {meetingBlocks.length === 0 ? (
              <div className="text-center py-6 text-stone-500 text-xs bg-white rounded-xl border border-stone-200">
                No meeting blocks currently detected on today's schedule! Add a meeting block to deflect or compress it.
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Select Meeting */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Select Meeting to Deflect
                    </label>
                    <select
                      value={selectedMeetingId || activeMeeting?.id}
                      onChange={(e) => setSelectedMeetingId(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-stone-200 text-stone-800"
                    >
                      {meetingBlocks.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title} ({m.startTime}-{m.endTime}, {m.durationMinutes}m)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Participants
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={50}
                      value={attendeesCount}
                      onChange={(e) => setAttendeesCount(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-stone-200 text-stone-800 font-mono"
                    />
                  </div>
                </div>

                {/* Additional Context */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Agenda / Decisions Needed (optional notes for AI memo)
                  </label>
                  <input
                    type="text"
                    value={agendaContext}
                    onChange={(e) => setAgendaContext(e.target.value)}
                    placeholder="E.g., Review sprint blockers, get marketing sign-off on release notes"
                    className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-stone-200 text-stone-800"
                  />
                </div>

                {/* Deflect Button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-stone-500 font-medium">
                    Burn Value: <span className="font-mono text-stone-900 font-bold">${Math.round((activeMeeting.durationMinutes / 60) * attendeesCount * hourlyRate)}</span>
                  </div>
                  <button
                    onClick={handleDeflectMeeting}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isGenerating ? 'Generating Executive Brief...' : 'Deflect Meeting to Async Memo'}</span>
                  </button>
                </div>

              </div>
            )}

            {/* Generated Async Briefing Results */}
            {generatedMemo && (
              <div className="mt-4 p-4 rounded-2xl bg-white border border-amber-500/40 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    {generatedMemo.headline}
                  </span>
                  <button
                    onClick={handleCopySlackSnippet}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Slack/Teams Snippet'}</span>
                  </button>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {generatedMemo.summary}
                </p>

                {generatedMemo.updates.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                      Asynchronous Updates
                    </div>
                    <ul className="text-xs text-stone-700 space-y-1 list-disc list-inside">
                      {generatedMemo.updates.map((u, i) => (
                        <li key={i}>{u}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedMemo.decisions.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                      Sign-Offs & Decisions Needed
                    </div>
                    <ul className="text-xs text-stone-800 font-medium space-y-1 list-disc list-inside bg-amber-50/50 p-2 rounded-lg border border-amber-200/60">
                      {generatedMemo.decisions.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold text-stone-400 mb-1">
                    Slack / MS Teams Deflection Script:
                  </div>
                  <pre className="text-[11px] font-mono bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-stone-800 whitespace-pre-wrap">
                    {generatedMemo.slackSnippet}
                  </pre>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Powered by ZEUS Corporate Cognitive Defense
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
