/* eslint-disable react/display-name, react/prop-types, @typescript-eslint/no-unsafe-argument */
import React, { useState, useEffect } from 'react';
// Removed explicit .ts extension for compatibility with CRA TypeScript config
import { calculateTimeRemaining } from '../utils/helpers';
import { Clock } from 'lucide-react';

interface FlashSaleTimerProps {
  endTime: string;
  className?: string;
  compact?: boolean;
}

const FlashSaleTimer: React.FC<FlashSaleTimerProps> = React.memo(({ 
  endTime, 
  className = '',
  compact = false 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(endTime);
      setTimeRemaining(remaining);
      
      if (remaining.isExpired) {
        clearInterval(timer as any);
      }
    }, 1000);

    return () => clearInterval(timer as any);
  }, [endTime]);

  if (timeRemaining.isExpired) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold border border-red-400/60 backdrop-blur-sm shadow-lg animate-pulse ${className}`}>
        <Clock size={12} className="text-red-200 animate-spin" />
        <span className="uppercase tracking-wide">BERAKHIR</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 text-white text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20 ${className}`}>
        <Clock size={10} className="text-pink-200 animate-pulse" />
        <span className="text-white font-mono tracking-tight">
          {timeRemaining.days > 0 ? (
            `${timeRemaining.days}d ${timeRemaining.hours.toString().padStart(2, '0')}:${timeRemaining.minutes.toString().padStart(2, '0')}`
          ) : (
            <span className={timeRemaining.hours === 0 && timeRemaining.minutes < 10 ? 'animate-pulse text-yellow-200' : ''}>
              {timeRemaining.hours.toString().padStart(2, '0')}:{timeRemaining.minutes.toString().padStart(2, '0')}:{timeRemaining.seconds.toString().padStart(2, '0')}
            </span>
          )}
        </span>
      </div>
    );
  }

  const isUrgent = timeRemaining.days === 0 && timeRemaining.hours < 1;
  const isCritical = timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes < 10;

  return (
    <div className={`relative inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 text-white border border-white/20 backdrop-blur-sm shadow-xl hover:shadow-pink-500/25 transition-all duration-300 ${isCritical ? 'animate-pulse' : ''} ${className}`}>
      <Clock size={14} className={`text-pink-200 ${isUrgent ? 'animate-pulse' : ''}`} />
      <div className="flex items-center gap-2 text-sm font-bold">
        {timeRemaining.days > 0 && (
          <div className="flex flex-col items-center">
            <span className="tabular-nums text-lg font-black text-white">{timeRemaining.days}</span>
            <span className="text-pink-200 text-[10px] uppercase tracking-wide font-medium">hari</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <span className={`tabular-nums text-lg font-black ${isCritical ? 'text-yellow-200' : 'text-white'}`}>
              {timeRemaining.hours.toString().padStart(2, '0')}
            </span>
            <span className="text-pink-200 text-[10px] uppercase tracking-wide font-medium">jam</span>
          </div>
          <span className="text-pink-300 text-lg font-bold mx-1">:</span>
          <div className="flex flex-col items-center">
            <span className={`tabular-nums text-lg font-black ${isCritical ? 'text-yellow-200' : 'text-white'}`}>
              {timeRemaining.minutes.toString().padStart(2, '0')}
            </span>
            <span className="text-pink-200 text-[10px] uppercase tracking-wide font-medium">mnt</span>
          </div>
          <span className="text-pink-300 text-lg font-bold mx-1">:</span>
          <div className="flex flex-col items-center">
            <span className={`tabular-nums text-lg font-black ${isCritical ? 'text-yellow-200 animate-pulse' : 'text-white'}`}>
              {timeRemaining.seconds.toString().padStart(2, '0')}
            </span>
            <span className="text-pink-200 text-[10px] uppercase tracking-wide font-medium">dtk</span>
          </div>
        </div>
      </div>
      
      {/* Animated background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-pink-400/20 rounded-xl animate-pulse opacity-50" />
    </div>
  );
});

export default FlashSaleTimer;
