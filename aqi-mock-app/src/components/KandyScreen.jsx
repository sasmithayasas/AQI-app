import React from 'react'

export default function KandyScreen({ data }) {
  return (
    <div className="min-h-screen text-on-surface font-body-md overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 w-screen h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-animate"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB8NfggItK43x5V2feqJsGZAE2faCm0O-41mQlmb6iAFnCT4h2DYeLR9MJrM1TKil--Lo_EpEZm1TBkqdU7tCC5Vw-i17kfZScUMKceyhUN6ezqwlfZ12Uw3vqMlHYIWg3Igf0BxjS0FVGQbFzKA2YimD_0aEm52MlRdSnLmyXjJaogAqWjweEetiPC-8EI9iGI2O1El7b9-rjDrt1aolxX74-iKLwaIXfWa8ckvi2zG3XH1_aRmuIRQw')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/30" />
      </div>

      {/* Header */}
      <header className="w-full top-0 sticky z-50 bg-surface/60 backdrop-blur-xl border-b border-white/30 shadow-[0_4px_12px_rgba(0,101,141,0.1)] h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button className="material-symbols-outlined text-primary hover:bg-white/20 p-2 rounded-full transition-all active:scale-95">menu</button>
          <h1 className="font-display-aqi text-primary tracking-tight text-2xl font-bold">AeroAQI</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-xs font-bold text-primary bg-primary-container/30 px-3 py-1 rounded-full border border-white/40 uppercase tracking-wider">Kandy, Sri Lanka</span>
          <button className="material-symbols-outlined text-primary hover:bg-white/20 p-2 rounded-full transition-all active:scale-95">account_circle</button>
        </div>
      </header>

      <main className="max-w-screen-lg mx-auto px-3 md:px-6 py-8 pb-32">
        {/* Hero: AQI Gauge */}
        <div className="flex flex-col md:flex-row gap-8 items-center mb-12">
          {/* Ring Gauge */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center frutiger-glass rounded-full p-4 group">
            <div className="absolute inset-0 skeletal-ring opacity-80 group-hover:opacity-100 transition-opacity rounded-full" />
            <div className="z-10 text-center">
              <span className="text-xs font-bold text-on-surface-variant block mb-1 uppercase tracking-widest">Current AQI</span>
              <span className="text-8xl font-bold text-primary drop-shadow-sm leading-none">{data.aqi}</span>
              <span className="text-xs font-bold text-secondary block mt-1 tracking-widest uppercase">Good</span>
            </div>
            <div className="absolute top-4 left-1/4 w-1/2 h-8 bg-white/40 rounded-[100%] blur-sm" />
          </div>

          {/* Info panel */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface drop-shadow-sm">Air Quality in Kandy</h2>
            <p className="text-on-surface-variant max-w-lg">The air quality is generally acceptable for most individuals. Enjoy your outdoor activities in the lush hills of the Central Province.</p>
            {/* Health alert */}
            <div className="frutiger-glass p-4 rounded-xl flex items-center gap-4 border-l-4 border-secondary overflow-hidden relative">
              <div className="flex-shrink-0 w-10 h-10 aqua-button rounded-full flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-xl">info</span>
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-secondary block uppercase tracking-wider">Health Recommendation</span>
                <p className="text-sm font-medium text-on-surface">Perfect time for a walk around Kandy Lake. No special precautions needed.</p>
              </div>
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-secondary/10 rounded-full blur-xl" />
            </div>
          </div>
        </div>

        {/* Pollutant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'PM 2.5', value: '12.4', unit: 'µg/m³', icon: 'filter_center_focus', tag: 'OPTIMAL', tagClass: 'text-secondary bg-secondary-container/50', barW: 'w-1/4', barC: 'bg-secondary' },
            { label: 'PM 10', value: '28.1', unit: 'µg/m³', icon: 'blur_on', tag: 'LOW', tagClass: 'text-secondary bg-secondary-container/50', barW: 'w-1/3', barC: 'bg-secondary' },
            { label: 'NO2', value: '15.8', unit: 'ppb', icon: 'gas_meter', tag: 'MODERATE', tagClass: 'text-tertiary bg-tertiary-fixed/50', barW: 'w-[55%]', barC: 'bg-tertiary' },
            { label: 'OZONE (O3)', value: '31.0', unit: 'ppb', icon: 'air', tag: 'FRESH', tagClass: 'text-secondary bg-secondary-container/50', barW: 'w-[15%]', barC: 'bg-secondary' },
          ].map((p) => (
            <div key={p.label} className="frutiger-glass p-6 rounded-3xl inner-glow group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary-container/40 rounded-2xl flex items-center justify-center border border-white/50">
                  <span className="material-symbols-outlined text-primary">{p.icon}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.tagClass}`}>{p.tag}</span>
              </div>
              <h3 className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">{p.label}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">{p.value}</span>
                <span className="text-xs text-on-surface-variant">{p.unit}</span>
              </div>
              <div className="mt-4 w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div className={`h-full ${p.barC} ${p.barW} rounded-full`} style={{ boxShadow: '0 0 8px rgba(65,105,0,0.5)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom info grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Map Card */}
          <div className="frutiger-glass p-8 rounded-3xl overflow-hidden relative">
            <h3 className="text-2xl font-bold text-primary mb-4">Localized Map</h3>
            <div className="w-full h-48 rounded-2xl overflow-hidden shadow-inner border border-white/40">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwc7N3F0VOsQ-4ijAOE0UCvdb0w-4j6zpQJT4gPC5YwRKfIixOZGNXtU8ZgSKOUf7CXPk79Jc01ujRD7DDkJ4qpbhMleDcAmVWsQ_HrDcnn9r7MVG3uOyu1W6hUFhhmNgpMY8ZJC6aJwsPMElJbYH9aXqXHJIy6bzH9mSEmD67Z9apMPUHyZqmNgKqlqxc4IuWoW0O86Hk1kAdmpIp4ed_Le4Tp16EUkgwIW_KbkpSNuMhyf2HCjEcWA')" }}
              />
            </div>
            <button className="mt-6 w-full py-3 rounded-xl aqua-button text-white font-bold tracking-wide active:scale-95 transition-transform">
              EXPLORE AREA
            </button>
          </div>

          {/* Tips + Weather */}
          <div className="space-y-6">
            <div className="frutiger-glass p-6 rounded-3xl">
              <h4 className="text-xs font-bold text-primary mb-3 uppercase tracking-widest">Environmental Tips</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary">eco</span>
                  <span className="text-sm">Morning air in Kandy is freshest between 6:00 AM and 8:00 AM.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">umbrella</span>
                  <span className="text-sm">High humidity expected today; air pollutants tend to disperse slower.</span>
                </li>
              </ul>
            </div>
            <div className="frutiger-glass p-6 rounded-3xl bg-primary-container/20 border-primary-container/30">
              <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Live Weather</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>wb_sunny</span>
                  <div>
                    <span className="text-2xl font-bold">{data.weather.temp}°C</span>
                    <span className="text-xs block text-on-surface-variant">Sunny Interludes</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">Humidity</span>
                  <span className="font-bold">{data.weather.humidity}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
