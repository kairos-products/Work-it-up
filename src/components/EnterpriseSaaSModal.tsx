import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ArrowRight,
  Calculator
} from 'lucide-react';
import { ZeusLogo } from './ZeusLogo';

interface EnterpriseSaaSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnterpriseSaaSModal: React.FC<EnterpriseSaaSModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [companySize, setCompanySize] = useState<number>(120);
  const [avgSalary, setAvgSalary] = useState<number>(135000);
  const [meetingsPerWeek, setMeetingsPerWeek] = useState<number>(12);
  const [requestedDemo, setRequestedDemo] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');

  if (!isOpen) return null;

  // ROI Math
  const hourlyRate = avgSalary / 2000;
  const annualMeetingHours = companySize * meetingsPerWeek * 48;
  const totalAnnualMeetingSpend = annualMeetingHours * hourlyRate;
  
  // Zeus 22% Meeting Deflation & Speed-Meeting Compression
  const hoursReclaimed = Math.round(annualMeetingHours * 0.22);
  const dollarsSaved = Math.round(hoursReclaimed * hourlyRate);
  const zeusEnterpriseAnnualCost = companySize * 79 * 12 * 0.8; // 20% discount on annual
  const netRoi = Math.round(((dollarsSaved - zeusEnterpriseAnnualCost) / zeusEnterpriseAnnualCost) * 100);

  const plans = [
    {
      name: 'ZEUS Executive Solo',
      tagline: 'For Directors, Founders & High-Output Operators',
      priceMonthly: 35,
      priceAnnual: 29,
      badge: null,
      features: [
        'AI Chronotype Circadian Engine',
        'ThunderShield™ Meeting Deflector',
        'ThunderPulse™ Neuro-Soundscapes',
        'Personal Swiss-Cheese Index Auditor',
        'Unlimited AI Day Architect Schedules',
      ],
      cta: 'Start 14-Day Executive Trial',
    },
    {
      name: 'ZEUS Enterprise Command',
      tagline: 'For Fast-Moving Engineering, Product & Corporate Teams',
      priceMonthly: 95,
      priceAnnual: 79,
      badge: 'MOST POPULAR IN ENTERPRISE',
      highlight: true,
      features: [
        'Everything in Executive Solo',
        'Olympus Radar™ Real-time Team Focus Sync',
        'Slack & Microsoft Teams Bi-directional Bot',
        'Corporate Calendar Auto-Defragmenter',
        'Departmental Meeting Burn-Rate Audit',
        'Google Workspace & Microsoft 365 Integration',
      ],
      cta: 'Deploy Enterprise Command',
    },
    {
      name: 'OLYMPUS Sovereign',
      tagline: 'For Global Enterprise, Regulated Finance & Defense',
      priceMonthly: 175,
      priceAnnual: 149,
      badge: 'AIR-GAPPED & COMPLIANT',
      features: [
        'Everything in Enterprise Command',
        'Air-Gapped Private Tenant LLM (Zero Retention)',
        'C-Suite & Board Cognitive Load Telemetry',
        'Custom SSO / SAML (Okta, Azure AD, Ping)',
        'Dedicated Enterprise Success Architect',
        'SOC2 Type II & HIPAA Compliance Guarantee',
      ],
      cta: 'Request Sovereign Proof-of-Concept',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-5xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 sm:p-8 bg-stone-950 text-white border-b border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-12 -translate-y-6">
            <ZeusLogo size="xl" showText={false} inverted={true} />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <ZeusLogo size="md" showText={true} inverted={true} />
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-mono tracking-widest uppercase border border-amber-400/30">
                ENTERPRISE SAAS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Reclaim 22%+ of Corporate Cognitive Bandwidth
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl">
              Equip your workforce with ZEUS: eliminate calendar fragmentation, audit meeting burn, and synchronize focus across departments.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center bg-stone-900 border border-stone-800 p-1 rounded-2xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual' ? 'bg-amber-400 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="text-[9px] bg-black/20 text-stone-950 px-1.5 py-0.5 rounded-full uppercase">Save 20%</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((p, idx) => {
              const price = billingCycle === 'annual' ? p.priceAnnual : p.priceMonthly;
              return (
                <div
                  key={idx}
                  className={`rounded-3xl p-6 flex flex-col justify-between transition-all relative ${
                    p.highlight
                      ? 'bg-stone-950 text-white shadow-xl ring-2 ring-amber-400'
                      : 'bg-stone-50 border border-stone-200 text-stone-900'
                  }`}
                >
                  {p.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-stone-950 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      {p.badge}
                    </div>
                  )}

                  <div>
                    <h3 className={`text-base font-bold ${p.highlight ? 'text-white' : 'text-stone-900'}`}>
                      {p.name}
                    </h3>
                    <p className={`text-xs mt-1 min-h-[32px] ${p.highlight ? 'text-stone-400' : 'text-stone-500'}`}>
                      {p.tagline}
                    </p>

                    <div className="my-5 flex items-baseline gap-1">
                      <span className="text-3xl font-black font-mono tracking-tight">
                        ${price}
                      </span>
                      <span className={`text-xs ${p.highlight ? 'text-stone-400' : 'text-stone-500'}`}>
                        / seat / month
                      </span>
                    </div>

                    <div className={`h-px my-4 ${p.highlight ? 'bg-stone-800' : 'bg-stone-200'}`} />

                    <ul className="space-y-2.5 text-xs">
                      {p.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${p.highlight ? 'text-amber-400' : 'text-emerald-600'}`} />
                          <span className={p.highlight ? 'text-stone-300' : 'text-stone-700'}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setRequestedDemo(true)}
                    className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                      p.highlight
                        ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md'
                        : 'bg-black hover:bg-stone-800 text-white'
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Interactive Corporate Workforce ROI Calculator */}
          <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-black text-amber-400 flex items-center justify-center font-bold">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Interactive Enterprise Workforce ROI Calculator
                </h3>
                <p className="text-xs text-stone-500">
                  Simulate annual meeting burn deflation and focus hours reclaimed across your workforce
                </p>
              </div>
            </div>

            {/* Input Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700">Company Workforce Size</span>
                  <span className="font-mono text-stone-950 font-bold">{companySize.toLocaleString()} team members</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={2500}
                  step={10}
                  value={companySize}
                  onChange={(e) => setCompanySize(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700">Average Annual Salary</span>
                  <span className="font-mono text-stone-950 font-bold">${avgSalary.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={70000}
                  max={250000}
                  step={5000}
                  value={avgSalary}
                  onChange={(e) => setAvgSalary(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700">Avg Weekly Meeting Hours</span>
                  <span className="font-mono text-stone-950 font-bold">{meetingsPerWeek} hrs / week</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={30}
                  value={meetingsPerWeek}
                  onChange={(e) => setMeetingsPerWeek(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

            </div>

            {/* Calculated Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-stone-400">
                  Annual Corporate Meeting Burn
                </div>
                <div className="text-2xl font-black font-mono text-stone-900 mt-1">
                  ${Math.round(totalAnnualMeetingSpend).toLocaleString()}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Current unoptimized payroll spend on calls
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-emerald-800">
                  Net Dollars Saved by ZEUS
                </div>
                <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
                  ${dollarsSaved.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-700/80 mt-0.5">
                  Via 22% meeting compression & async deflection
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-amber-800">
                  Hours of Deep Focus Reclaimed
                </div>
                <div className="text-2xl font-black font-mono text-amber-900 mt-1">
                  {hoursReclaimed.toLocaleString()} hrs / yr
                </div>
                <div className="text-[11px] text-amber-800/80 mt-0.5">
                  Estimated ROI: <span className="font-bold">{netRoi}%</span>
                </div>
              </div>

            </div>
          </div>

          {/* Pilot Request Modal / Section */}
          {requestedDemo && (
            <div className="p-6 rounded-3xl bg-stone-900 text-white border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Request Executive Onboarding & Custom Pilot
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    We will configure your custom ZEUS tenant with calendar connectors and department radars.
                  </p>
                </div>
                <button
                  onClick={() => setRequestedDemo(false)}
                  className="text-stone-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter corporate work email (e.g., alex@enterprise.com)"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs flex-1 text-white placeholder-stone-400"
                />
                <button
                  onClick={() => {
                    alert(`Thank you! ZEUS Enterprise Deployment kit sent to ${emailInput || 'your executive account'}.`);
                    setRequestedDemo(false);
                  }}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
                >
                  Generate Enterprise Pilot Token
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>SOC2 Type II Certified • GDPR & HIPAA Compliant • 99.99% SLA</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
