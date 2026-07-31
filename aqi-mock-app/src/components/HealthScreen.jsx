import React from 'react'

export default function HealthScreen() {
  return (
    <div className="min-h-screen font-body-md text-on-surface">
      {/* Frutiger background gradient */}
      <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #dcfce7 100%)' }} />
      <div className="floating-orb" style={{ top: '-100px', right: '-100px' }} />
      <div className="floating-orb" style={{ bottom: '100px', left: '-100px', background: 'radial-gradient(circle, rgba(183, 245, 104, 0.2) 0%, transparent 70%)' }} />

      {/* Header */}
      <header className="w-full top-0 sticky z-50 bg-surface/60 backdrop-blur-xl border-b border-white/30 shadow-[0_4px_12px_rgba(0,101,141,0.1)] flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">menu</span>
          <h1 className="text-2xl font-bold text-primary tracking-tight">AeroAQI</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 px-3 py-1 bg-white/40 rounded-full border border-white/50 text-secondary font-bold">
            <span className="material-symbols-outlined text-lg">location_on</span>
            <span className="text-xs uppercase tracking-wider">Colombo, SL</span>
          </div>
          <span className="material-symbols-outlined text-primary">account_circle</span>
        </div>
      </header>

      <main className="max-w-screen-lg mx-auto px-4 py-8 pb-32">
        {/* Hero: Health Summary */}
        <section className="glass-pod p-6 mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Glossy ring gauge */}
            <div className="relative group">
              <div className="glossy-ring w-48 h-48 flex items-center justify-center ambient-glow-green">
                <div className="bg-white rounded-full w-40 h-40 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at top left, #416900, transparent)' }} />
                  <span className="text-5xl font-bold text-secondary leading-none">32</span>
                  <span className="text-xs font-bold text-secondary/70 uppercase tracking-wider">AQI</span>
                  <span className="font-bold text-secondary text-sm mt-1">EXCELLENT</span>
                </div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-primary mb-2">Pristine Air Quality</h2>
              <p className="text-on-surface-variant max-w-lg mb-4">
                Current conditions in Sri Lanka are optimal for respiratory health. The morning mist has cleared, leaving behind crisp, oxygen-rich air with minimal particulate matter.
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {['PM2.5: 8 µg/m³', 'Humidity: 65%', 'UV: Low'].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold ring-1 ring-white/50">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          {/* BG image (desktop) */}
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 hidden md:block">
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCmk51FQud-4yhn6qijDiHTOnXQIj0nuMZEt01-6-rzc6OOO3JTrJyZbuOAfz7o-UHvq-a5oJqX-kqWxa3mSeFRCEi-Lz3ci7VkcD3jbnj9J5pei8DdnqhoFqqUsfOXRBeFifK-9bi55-gLv0SFT5ZsWB8XxkH1f1vrezdt5brO6UzdGPrBRa-BMaEFkUGFUSbJ-OzN0PEwDcu5E_KCxtAuf9xT0o4uDYG4mN0tQd43_pMdLOhu-mpO6g')" }} />
          </div>
        </section>

        {/* Activities Bento */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <h3 className="col-span-full text-2xl font-bold text-primary-fixed-dim bg-primary px-6 py-2 rounded-full inline-block w-fit shadow-lg mb-2">
            Recommended Activities
          </h3>
          {[
            { icon: 'directions_run', label: 'Running', desc: 'Perfect time for a long-distance run at Galle Face Green.', tag: 'Highly Recommended' },
            { icon: 'directions_bike', label: 'Cycling', desc: 'The air purity allows for peak cardiovascular performance.', tag: 'Peak Condition' },
            { icon: 'self_improvement', label: 'Yoga', desc: 'Deep breathing exercises are most effective in current AQI.', tag: 'Optimal Purity' },
          ].map(a => (
            <div key={a.label} className="glass-pod p-6 flex flex-col items-center text-center transition-transform hover:scale-[1.02] cursor-pointer">
              <div className="bubble-icon mb-4">
                <span className="material-symbols-outlined text-primary text-4xl">{a.icon}</span>
              </div>
              <h4 className="text-xl font-bold text-primary mb-2">{a.label}</h4>
              <p className="text-sm text-on-surface-variant mb-4">{a.desc}</p>
              <div className="mt-auto flex items-center gap-1 text-secondary font-bold">
                <span className="material-symbols-outlined">check_circle</span>
                <span className="text-xs uppercase">{a.tag}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Health cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-pod p-8 border-l-8 border-secondary">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary/10 rounded-2xl">
                <span className="material-symbols-outlined text-secondary text-3xl">medical_services</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-on-secondary-fixed-variant mb-2">For Sensitive Groups</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">Asthma and allergy sufferers can breathe easy today. Pollen counts are moderate, but the overall low pollution provides a safe environment for all outdoor tasks.</p>
              </div>
            </div>
          </div>
          <div className="glass-pod p-8 border-l-8 border-primary">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <span className="material-symbols-outlined text-primary text-3xl">lightbulb</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-on-primary-fixed-variant mb-2">Health Tip of the Day</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">Take advantage of the 32 AQI by opening all windows for cross-ventilation. This will flush out indoor pollutants and refresh your living space naturally.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Health Forecast */}
        <section className="glass-pod p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-primary">Regional Health Forecast</h3>
            <button className="aqua-button px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest">Details</button>
          </div>
          <div className="space-y-4">
            {[
              { letter: 'C', city: 'Colombo District', type: 'Urban Coastal', aqi: '32 AQI', color: 'text-secondary', barW: 'w-1/3', barC: 'bg-secondary' },
              { letter: 'K', city: 'Kandy District', type: 'Central Highlands', aqi: '28 AQI', color: 'text-secondary', barW: 'w-1/4', barC: 'bg-secondary' },
              { letter: 'J', city: 'Jaffna District', type: 'Northern Peninsula', aqi: '45 AQI', color: 'text-tertiary', barW: 'w-1/2', barC: 'bg-tertiary' },
            ].map(r => (
              <div key={r.city} className="flex items-center justify-between p-4 bg-white/20 rounded-2xl hover:bg-white/40 transition-colors border border-white/20">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center ${r.color} font-bold`}>{r.letter}</div>
                  <div>
                    <p className="font-bold text-on-surface">{r.city}</p>
                    <p className="text-xs text-on-surface-variant">{r.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${r.color}`}>{r.aqi}</p>
                  <div className="w-24 h-2 bg-surface-container rounded-full mt-1 overflow-hidden">
                    <div className={`${r.barW} h-full ${r.barC}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
