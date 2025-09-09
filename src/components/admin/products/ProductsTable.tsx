import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Product } from '../../../types';
import { formatNumberID } from '../../../utils/helpers';
import { ProductActions } from './ProductActions';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Game</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex items-center gap-4">
                <img
                  src={product.image || `https://via.placeholder.com/64?text=No+Img`}
                  alt={product.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div className="font-medium">{product.name}</div>
              </div>
            </TableCell>
            <TableCell>{product.gameTitleData?.name || product.gameTitle}</TableCell>
            <TableCell>{formatNumberID(product.price)}</TableCell>
            <TableCell>
              <Badge variant={product.isActive ? 'default' : 'destructive'}>
                {product.isActive ? 'Active' : 'Archived'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <ProductActions product={product} onEdit={onEdit} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
