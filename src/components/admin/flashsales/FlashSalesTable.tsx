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
import { FlashSaleWithProduct, Product } from '../../../types';
import { format } from 'date-fns';
import { formatNumberID } from '../../../utils/helpers';

interface FlashSalesTableProps {
  flashSales: FlashSaleWithProduct[];
  onEdit: (sale: FlashSaleWithProduct) => void;
  onDelete: (sale: FlashSaleWithProduct) => void;
}

export function FlashSalesTable({ flashSales, onEdit, onDelete }: FlashSalesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Sale Price</TableHead>
          <TableHead>Original Price</TableHead>
          <TableHead>Starts</TableHead>
          <TableHead>Ends</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flashSales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell className="font-medium">{sale.product?.name || 'N/A'}</TableCell>
            <TableCell>{formatNumberID(sale.salePrice)}</TableCell>
            <TableCell>
              <del>{formatNumberID(sale.originalPrice)}</del>
            </TableCell>
            <TableCell>{sale.startTime ? format(new Date(sale.startTime), 'PPpp') : '-'}</TableCell>
            <TableCell>{format(new Date(sale.endTime), 'PPpp')}</TableCell>
            <TableCell>{sale.stock ?? '∞'}</TableCell>
            <TableCell>
              <Badge variant={sale.isActive ? 'default' : 'secondary'}>
                {sale.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(sale)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(sale)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
