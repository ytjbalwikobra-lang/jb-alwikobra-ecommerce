import { RefreshCw, Search, PlusCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

interface UsersPageHeaderProps {
  onRefresh: () => void;
  onSearch: (term: string) => void;
  searchTerm: string;
}

export function UsersPageHeader({ onRefresh, onSearch, searchTerm }: UsersPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage all users and their roles.</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, or ID..."
            className="pl-8 sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
