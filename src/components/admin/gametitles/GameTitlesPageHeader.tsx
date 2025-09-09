import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';

interface GameTitlesPageHeaderProps {
  onAdd: () => void;
}

export function GameTitlesPageHeader({ onAdd }: GameTitlesPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Game Titles</h1>
      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Add Game Title
      </Button>
    </div>
  );
}
