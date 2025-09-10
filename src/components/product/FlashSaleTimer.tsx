import React from 'react';
import { Clock } from 'lucide-react';
import { calculateTimeRemaining } from '../../utils/helpers';

interface FlashSaleTimerProps {
  timeRemaining: ReturnType<typeof calculateTimeRemaining>;
}

export const FlashSaleTimer: React.FC<FlashSaleTimerProps> = ({ timeRemaining }) => {
  return (
    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
      <div className="flex items-center space-x-2 text-red-400 font-medium mb-2">
        <Clock size={20} />
        <span>Flash Sale berakhir dalam:</span>
      </div>
      <div className="flex space-x-3">
        <div className="text-center">
          <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg">
            {timeRemaining.days.toString().padStart(2, '0')}
          </div>
          <span className="text-xs text-red-400 mt-1">Hari</span>
        </div>
        <div className="text-center">
          <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg">
            {timeRemaining.hours.toString().padStart(2, '0')}
          </div>
          <span className="text-xs text-red-400 mt-1">Jam</span>
        </div>
        <div className="text-center">
          <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg">
            {timeRemaining.minutes.toString().padStart(2, '0')}
          </div>
          <span className="text-xs text-red-400 mt-1">Menit</span>
        </div>
        <div className="text-center">
          <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg">
            {timeRemaining.seconds.toString().padStart(2, '0')}
          </div>
          <span className="text-xs text-red-400 mt-1">Detik</span>
        </div>
      </div>
    </div>
  );
};
