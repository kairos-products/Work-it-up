import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Zap, 
  Copy, 
  Check, 
  Search, 
  BellOff, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { TeamMember } from '../types';

const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Elena Rostova',
    role: 'VP of Product Strategy',
    department: 'Executive',
    timezone: 'America/New_York',
    city: 'New York (EDT)',
    status: 'deep-focus',
    currentFocus: 'Q4 Capital Allocation & Board Deck Synthesis',
    untilTime: '11:45 AM',
    shieldActive: true,
    focusScore: 94,
  },
  {
    id: 'tm-2',
    name: 'Marcus Vance',
    role: 'Staff Infrastructure Architect',
    department: 'Engineering',
    timezone: 'America/Los_Angeles',
    city: 'San Francisco (PDT)',
    status: 'deep-focus',
    currentFocus: 'Core Distributed Consensus Engine Migration',
    untilTime: '10:30 AM',
    shieldActive: true,
    focusScore: 98,
  },
  {
    id: 'tm-3',
    name: 'Sarah Chen',
    role: 'Director of Quantitative Research',
    department: 'Revenue & Growth',
    timezone: 'Europe/London',
    city: 'London (BST)',
    status: 'in-meeting',
    currentFocus: 'Executive Committee Weekly Sync',
    untilTime: '04:00 PM',
    shieldActive: false,
    focusScore: 82,
  },
  {
    id: 'tm-4',
    name: 'Kenji Takahashi',
    role: 'Lead Systems Engineer',
    department: 'Engineering',
    timezone: 'Asia/Tokyo',
    city: 'Tokyo (JST)',
    status: 'available',
    currentFocus: 'Code review triage & architectural PR approvals',
    untilTime: '07:30 PM',
    shieldActive: false,
    focusScore: 78,
  },
  {
    id: 'tm-5',
    name: 'Claire Beauchamp',
    role: 'Head of Enterprise Design Systems',
    department: 'Product & Design',
    timezone: 'Europe/Paris',
    city: 'Paris (CEST)',
    status: 'deep-focus',
    currentFocus: 'Zeus Design Language v3 Tokenization',
    untilTime: '03:15 PM',
    shieldActive: true,
    focusScore: 91,
  },
];

interface OlympusTeamRadarProps {
  myCurrentFocus?: string;
  myUntilTime?: string;
  isMyShieldActive?: boolean;
}

export const OlympusTeamRadar: React.FC<OlympusTeamRadarProps> = ({
  myCurrentFocus = 'Deep Work: System Architecture Design',
  myUntilTime = '11:00 AM',
  isMyShieldActive = true,
}) => {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [activeDept, setActiveDept] = useState<string>('All');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = team.filter((m) => {
    const matchesDept = activeDept === 'All' || m.department === activeDept;
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.currentFocus.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const deepFocusCount = team.filter((m) => m.status === 'deep-focus').length;
  const teamFocusIndex = Math.round((deepFocusCount / team.length) * 100);

  const handleCopySlackStatus = () => {
    const statusText = `⚡ ZEUS Shield Active: ${myCurrentFocus} (Protected Focus until ${myUntilTime}) • Do Not Disturb • Urgent? Escalate to VIP queue`;
    navigator.clipboard.writeText(statusText);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-black text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Olympus Radar™ • Enterprise Focus Sync
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Asynchronous corporate presence & protected flow state radar across global timezones
          </p>
        </div>

        {/* Global Focus Metric */}
        <div className="flex items-center gap-4 bg-stone-50 border border-stone-200 p-2.5 px-4 rounded-2xl shrink-0">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400">
              Team Focus Health
            </div>
            <div className="text-base font-bold font-mono text-stone-900 flex items-center gap-1.5">
              <span>{teamFocusIndex}% in Deep Flow</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-px bg-stone-200" />
          <button
            onClick={handleCopySlackStatus}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
            title="Copy rich Slack/Teams status with auto-clearing timer"
          >
            {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedStatus ? 'Copied Status!' : 'Sync to Slack / Teams'}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Executive', 'Engineering', 'Product & Design', 'Revenue & Growth'].map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeDept === dept
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search colleague, role or focus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl w-full sm:w-60 focus:bg-white text-stone-800 placeholder-stone-400"
          />
        </div>
      </div>

      {/* Teammates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((member) => {
          const isShield = member.status === 'deep-focus';
          const isMeeting = member.status === 'in-meeting';
          const isAvailable = member.status === 'available';

          return (
            <div
              key={member.id}
              className={`p-4 rounded-2xl border transition-all ${
                isShield
                  ? 'bg-gradient-to-b from-stone-900 to-stone-950 text-white border-stone-800 shadow-md'
                  : 'bg-stone-50/70 border-stone-200 text-stone-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div 
                    className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs ${
                      isShield 
                        ? 'bg-amber-500 text-black shadow-xs' 
                        : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                      <span>{member.name}</span>
                      {isShield && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/30">
                          SHIELD
                        </span>
                      )}
                    </h4>
                    <p className={`text-[11px] ${isShield ? 'text-stone-400' : 'text-stone-500'}`}>
                      {member.role}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isShield
                      ? 'bg-amber-500/20 text-amber-300'
                      : isMeeting
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isShield ? 'Deep Focus' : isMeeting ? 'In Meeting' : 'Available'}
                </span>
              </div>

              {/* Focus Details */}
              <div className={`text-xs p-2.5 rounded-xl my-2 ${isShield ? 'bg-stone-800/80 text-stone-200' : 'bg-white border border-stone-200/80 text-stone-700'}`}>
                <div className="text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                  Active Mission
                </div>
                <p className="line-clamp-2 leading-snug font-medium">
                  {member.currentFocus}
                </p>
              </div>

              {/* Footer Location & Shield status */}
              <div className={`flex items-center justify-between text-[11px] pt-1 ${isShield ? 'text-stone-400' : 'text-stone-500'}`}>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{member.city}</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>Until {member.untilTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
