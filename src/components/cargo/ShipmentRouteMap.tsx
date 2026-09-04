import React from 'react';
import { Shipment } from '../../types/cargo';
import { MapPin, Navigation, Truck, Building2, CheckCircle2 } from 'lucide-react';

interface ShipmentRouteMapProps {
  shipment: Shipment;
}

export const ShipmentRouteMap: React.FC<ShipmentRouteMapProps> = ({ shipment }) => {
  const { route } = shipment;
  const isDelivered = shipment.status === 'teslim_edildi';

  return (
    <div className="relative rounded-3xl bg-[#0B0F1C]/90 border border-white/10 p-5 md:p-6 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">
              Canlı Rota & Transfer Güzergahı
            </h4>
            <p className="text-[11px] text-white/50 font-medium">
              {route.origin.city} ➔ {route.destination.city} Sevkiyat Hattı
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-white">
          <span className="text-white/40">Yol İlerlemesi:</span>
          <span className="text-amber-400 font-black">%{route.progressPercent}</span>
        </div>
      </div>

      {/* SVG Interactive Map Canvas */}
      <div className="relative w-full h-56 sm:h-64 rounded-2xl bg-gradient-to-b from-[#090C16] to-[#0D1322] border border-white/5 overflow-hidden flex items-center justify-center">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 tactical-dots opacity-20" />
        
        {/* Abstract Map Contours */}
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor={isDelivered ? '#10B981' : '#F59E0B'} />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Route Path (Uncompleted) */}
          <path
            d={`M ${route.origin.xPercent} ${route.origin.yPercent} Q ${(route.origin.xPercent + route.destination.xPercent) / 2} ${Math.min(route.origin.yPercent, route.destination.yPercent) - 15} ${route.destination.xPercent} ${route.destination.yPercent}`}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
            strokeDasharray="4 4"
          />

          {/* Active Completed Route Path */}
          <path
            d={`M ${route.origin.xPercent} ${route.origin.yPercent} Q ${(route.origin.xPercent + route.destination.xPercent) / 2} ${Math.min(route.origin.yPercent, route.destination.yPercent) - 15} ${route.destination.xPercent} ${route.destination.yPercent}`}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3.5"
            strokeDasharray="100"
            strokeDashoffset={100 - route.progressPercent}
            filter="url(#glow)"
            className="transition-all duration-1000"
          />
        </svg>

        {/* Origin Node */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
          style={{ left: `${route.origin.xPercent}%`, top: `${route.origin.yPercent}%` }}
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.6)]">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-white whitespace-nowrap shadow-md">
            {route.origin.label}
          </span>
        </div>

        {/* Transfer Hub Node */}
        {route.transferHubs.map((hub, idx) => (
          <div
            key={idx}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
            style={{ left: `${hub.xPercent}%`, top: `${hub.yPercent}%` }}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              hub.completed
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                : 'bg-white/10 border-white/30 text-white/50'
            }`}>
              <Building2 className="w-3 h-3" />
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-white/80 whitespace-nowrap shadow-md">
              {hub.label}
            </span>
          </div>
        ))}

        {/* Destination Node */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
          style={{ left: `${route.destination.xPercent}%`, top: `${route.destination.yPercent}%` }}
        >
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
            isDelivered
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.7)]'
              : 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse'
          }`}>
            <MapPin className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-white whitespace-nowrap shadow-md">
            {route.destination.label}
          </span>
        </div>

        {/* Animated Moving Delivery Vehicle on Path */}
        {!isDelivered && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700 pointer-events-none"
            style={{
              left: `${route.origin.xPercent + (route.destination.xPercent - route.origin.xPercent) * (route.progressPercent / 100)}%`,
              top: `${route.origin.yPercent + (route.destination.yPercent - route.origin.yPercent) * (route.progressPercent / 100) - Math.sin((route.progressPercent / 100) * Math.PI) * 12}%`
            }}
          >
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-bounce">
              <Truck className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        )}
      </div>

      {/* Route Quick Summary Info Bar */}
      <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div>
            <span className="text-[10px] text-white/40 block">Çıkış İli & Şubesi:</span>
            <span className="font-bold text-white">{shipment.sender.city} - {shipment.sender.branch}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <div>
            <span className="text-[10px] text-white/40 block">Son Görülen Konum:</span>
            <span className="font-bold text-cyan-300">{shipment.events[0]?.facility || 'Aktarma Merkezi'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div>
            <span className="text-[10px] text-white/40 block">Hedef Teslim Noktası:</span>
            <span className="font-bold text-white">{shipment.receiver.city} / {shipment.receiver.district}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
