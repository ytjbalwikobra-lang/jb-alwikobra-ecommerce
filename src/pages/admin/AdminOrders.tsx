import React, { useMemo } from 'react';
import { Eye, Edit, Trash2, Download, ExternalLink } from 'lucide-react';
import { useAdminData, usePagination } from '../../hooks/useAdminData.ts';
import { AdminButton } from '../../components/admin/AdminButton.tsx';
import { AdminPillBadge } from '../../components/admin/AdminPillBadge.tsx';
import AdminDataTable from '../../components/admin/AdminDataTable.tsx';
import AdminErrorBoundary from '../../components/admin/AdminErrorBoundary.tsx';
import AdminCard from '../../components/admin/AdminCard.tsx';
import { LoadingState } from '../../components/admin/LoadingStates.tsx';

interface Order {
  id: string;
  product_id: string | null;
  product_name: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_type: 'purchase' | 'rental';
  amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  payment_method: 'xendit' | 'whatsapp';
  rental_duration?: string | null;
  created_at: string;
}

const AdminOrdersRefactored: React.FC = () => {
  const pagination = usePagination({
    defaultPageSize: 20,
  });

  // Fetch orders data
  const { data: ordersData, loading, error, refetch } = useAdminData<{
    orders: Order[];
    pagination: { total: number; page: number; limit: number };
  }>({
    endpoint: 'orders',
    params: {
      page: pagination.currentPage,
      limit: pagination.pageSize,
    },
    dependencies: [pagination.currentPage, pagination.pageSize],
    cacheKey: `orders-${pagination.currentPage}-${pagination.pageSize}`,
    transform: (data) => ({
      orders: (data.orders || []).map((order: any) => ({
        id: order.id,
        product_id: order.product_id ?? order.productId ?? null,
        product_name: order.product_name ?? order.productName ?? order.product?.name ?? null,
        customer_name: order.customer_name ?? order.customerName ?? order.customer?.name ?? 'Unknown',
        customer_email: order.customer_email ?? order.customerEmail ?? order.customer?.email ?? '',
        customer_phone: order.customer_phone ?? order.customerPhone ?? order.customer?.phone ?? '',
        order_type: order.order_type ?? order.orderType ?? 'purchase',
        amount: Number(order.amount ?? 0),
        status: (order.status ?? 'pending') as Order['status'],
        payment_method: order.payment_method ?? order.paymentMethod ?? 'whatsapp',
        rental_duration: order.rental_duration ?? order.rentalDuration ?? null,
        created_at: order.created_at ?? order.createdAt ?? new Date().toISOString(),
      })),
      pagination: data.pagination || { total: 0, page: 1, limit: 20 }
    })
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge variant
  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Table columns configuration
  const columns = useMemo(() => [
    {
      key: 'id',
      title: 'Order ID',
      render: (value: string) => (
        <span className="font-mono text-sm text-orange-400">#{value.slice(-8)}</span>
      ),
      mobileHidden: true
    },
    {
      key: 'product_name',
      title: 'Product',
      render: (value: string | null, record: Order) => (
        <div>
          <p className="text-white font-medium">{value || 'N/A'}</p>
          {record.order_type === 'rental' && record.rental_duration && (
            <p className="text-xs text-gray-400">Rental: {record.rental_duration}</p>
          )}
        </div>
      )
    },
    {
      key: 'customer_name',
      title: 'Customer',
      render: (value: string, record: Order) => (
        <div>
          <p className="text-white font-medium">{value}</p>
          <p className="text-xs text-gray-400">{record.customer_email}</p>
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value: number) => (
        <span className="font-semibold text-green-400">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: Order['status']) => (
        <AdminPillBadge variant={getStatusVariant(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </AdminPillBadge>
      )
    },
    {
      key: 'created_at',
      title: 'Date',
      render: (value: string) => (
        <span className="text-sm text-gray-300">{formatDate(value)}</span>
      ),
      mobileHidden: true
    }
  ], []);

  // Table actions
  const actions = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (record: Order) => {
        // Navigate to order detail
        window.location.href = `/admin/orders/${record.id}`;
      },
      variant: 'secondary' as const
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (record: Order) => {
        // Open edit modal or navigate to edit page
        console.log('Edit order:', record.id);
      },
      variant: 'primary' as const
    }
  ];

  // Mobile card render
  const mobileCardRender = (record: Order, index: number) => (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-mono text-sm text-orange-400">#{record.id.slice(-8)}</p>
          <p className="text-white font-medium">{record.product_name || 'N/A'}</p>
        </div>
        <AdminPillBadge variant={getStatusVariant(record.status)}>
          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
        </AdminPillBadge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-400">Customer:</span>
          <p className="text-white">{record.customer_name}</p>
        </div>
        <div>
          <span className="text-gray-400">Amount:</span>
          <p className="text-green-400 font-semibold">{formatCurrency(record.amount)}</p>
        </div>
      </div>
      
      <div className="text-xs text-gray-400">
        {formatDate(record.created_at)}
      </div>
      
      <div className="flex space-x-2 pt-2 border-t border-gray-700">
        {actions.map((action, actionIndex) => (
          <AdminButton
            key={actionIndex}
            variant={action.variant}
            size="sm"
            icon={action.icon}
            onClick={() => action.onClick(record)}
          >
            {action.label}
          </AdminButton>
        ))}
      </div>
    </div>
  );

  if (error) {
    return (
      <AdminCard title="Orders" subtitle="Manage customer orders">
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">Failed to load orders: {error.message}</p>
          <AdminButton variant="primary" onClick={refetch}>
            Retry
          </AdminButton>
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Orders</h1>
            <p className="text-gray-400">Manage customer orders and transactions</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <AdminButton
              variant="secondary"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={() => {
                // Export orders functionality
                console.log('Export orders');
              }}
            >
              Export
            </AdminButton>
            
            <AdminButton
              variant="primary"
              size="sm"
              icon={<ExternalLink className="h-4 w-4" />}
              onClick={() => {
                // Add new order functionality
                console.log('Add new order');
              }}
            >
              Add Order
            </AdminButton>
          </div>
        </div>

        {/* Orders Table */}
        <AdminDataTable
          columns={columns}
          data={ordersData?.orders || []}
          loading={loading}
          pagination={ordersData?.pagination ? {
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: ordersData.pagination.total,
            onChange: pagination.setPage
          } : undefined}
          searchable
          filterable
          actions={actions}
          mobileCardRender={mobileCardRender}
          emptyText="No orders found"
        />
      </div>
    </AdminErrorBoundary>
  );
};

export default AdminOrdersRefactored;
