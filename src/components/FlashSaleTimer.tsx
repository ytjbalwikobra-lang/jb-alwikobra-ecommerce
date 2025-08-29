import React, { useState, useEffect } from 'react';
import { calculateTimeRemaining } from '../utils/helpers.ts';
import { Clock } from 'lucide-react';

interface FlashSaleTimerProps {
  endTime: string;
  className?: string;
  compact?: boolean;
}

const FlashSaleTimer: React.FC<FlashSaleTimerProps> = ({ 
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
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (timeRemaining.isExpired) {
    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-500/30 text-gray-400 text-xs font-semibold border border-gray-500/60 backdrop-blur-sm ${className}`}>
        <Clock size={12} />
        <span>BERAKHIR</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/30 text-white text-xs font-semibold border border-red-400/60 backdrop-blur-sm ${className}`}>
        <Clock size={12} />
        <span>{timeRemaining.hours.toString().padStart(2, '0')}:{timeRemaining.minutes.toString().padStart(2, '0')}:{timeRemaining.seconds.toString().padStart(2, '0')}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 text-red-600 border border-red-200 backdrop-blur-sm shadow-lg ${className}`}>
      <Clock size={14} />
      <div className="flex items-center gap-1 text-sm font-bold">
        {timeRemaining.days > 0 && (
          <>
            <span className="tabular-nums">{timeRemaining.days}</span>
            <span className="text-red-400 text-xs">d</span>
          </>
        )}
        <span className="tabular-nums">{timeRemaining.hours.toString().padStart(2, '0')}</span>
        <span className="text-red-400">:</span>
        <span className="tabular-nums">{timeRemaining.minutes.toString().padStart(2, '0')}</span>
        <span className="text-red-400">:</span>
        <span className="tabular-nums">{timeRemaining.seconds.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default FlashSaleTimer;
