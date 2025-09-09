import React from 'react';
import { Button } from "../../ui/button";
import { Download } from 'lucide-react';
import TimePeriodFilter from './TimePeriodFilter';
import { TimePeriod } from './TimePeriodFilter';

type DashboardHeaderProps = {
  onExport: () => void;
  onTimePeriodChange: (timePeriod: TimePeriod) => void;
  timePeriod: TimePeriod;
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onExport, onTimePeriodChange, timePeriod }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex items-center space-x-2">
        <TimePeriodFilter value={timePeriod} onChange={onTimePeriodChange} />
        <Button onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
