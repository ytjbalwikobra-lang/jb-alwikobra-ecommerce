import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { GameTitle } from '../../../types';

interface GameTitlesTableProps {
  gameTitles: GameTitle[];
  onEdit: (gameTitle: GameTitle) => void;
  onDelete: (gameTitle: GameTitle) => void;
}

export function GameTitlesTable({ gameTitles, onEdit, onDelete }: GameTitlesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gameTitles.map((gt) => (
          <TableRow key={gt.id}>
            <TableCell className="font-medium flex items-center gap-3">
              {gt.logoUrl ? (
                <img src={gt.logoUrl} alt={gt.name} className="w-8 h-8 rounded-md object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-md bg-muted" />
              )}
              <span>{gt.name}</span>
            </TableCell>
            <TableCell>{gt.slug}</TableCell>
            <TableCell>
              <Badge variant={gt.isActive ? 'default' : 'secondary'}>
                {gt.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(gt)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(gt)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
