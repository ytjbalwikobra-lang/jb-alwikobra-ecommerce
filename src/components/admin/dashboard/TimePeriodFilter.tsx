import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

export type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'weekly' | 'monthly' | 'yearly' | 'all';

type TimePeriodFilterProps = {
  onChange: (value: TimePeriod) => void;
  value: TimePeriod;
};

const TimePeriodFilter: React.FC<TimePeriodFilterProps> = ({ onChange, value }) => {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="30d">Last 30 days</SelectItem>
        <SelectItem value="90d">Last 90 days</SelectItem>
        <SelectItem value="1y">Last year</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default TimePeriodFilter;
