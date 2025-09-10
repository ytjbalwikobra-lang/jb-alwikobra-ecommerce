import React, { useEffect useCallback } from 'react';
import { useToast } from '../../components/Toast';
import { RefreshCw, Filter, RotateCcw } from 'lucide-react';
import { AdminPillBadge } from '../../components/admin/AdminPillBadge';

type OrderRow = {
  id: string;
  product_id: string | null;
  product_name?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_type: 'purchase'|'rental';
  amount: number;
  status: 'pending'|'paid'|'completed'|'cancelled';
  payment_method: 'xendit'|'whatsapp';
  rental_duration?: string | null;
  created_at: string;
};

const AdminOrders: React.FC = () => {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'paid'|'completed'|'cancelled'>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all'|'purchase'|'rental'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Pagination states (like AdminProducts)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);
  
  const { push } = useToast();

  // Calculate total pages
  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, orderTypeFilter, searchTerm, itemsPerPage]);

  // Debounce search term to limit requests while typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const mapRow = (r: Record<string, unknown>): OrderRow => {
    // Explicitly cast each field to expected type to avoid unsafe any assignment
    const id = String(r.id ?? '');
    const product_id = r.product_id ? String(r.product_id) : r.productId ? String(r.productId) : null;
    const product_name = r.product_name ? String(r.product_name) : r.productName ? String(r.productName) : (r.product as Record<string, unknown>)?.name ? String((r.product as Record<string, unknown>).name) : null;
    const customer_name = r.customer_name ? String(r.customer_name) : r.customerName ? String(r.customerName) : (r.customer as Record<string, unknown>)?.name ? String((r.customer as Record<string, unknown>).name) : 'Unknown';
    const customer_email = r.customer_email ? String(r.customer_email) : r.customerEmail ? String(r.customerEmail) : (r.customer as Record<string, unknown>)?.email ? String((r.customer as Record<string, unknown>).email) : '';
    const customer_phone = r.customer_phone ? String(r.customer_phone) : r.customerPhone ? String(r.customerPhone) : (r.customer as Record<string, unknown>)?.phone ? String((r.customer as Record<string, unknown>).phone) : '';
    const order_type = (r.order_type ?? r.orderType ?? 'purchase') as OrderRow['order_type'];
    const amount = Number(r.amount ?? 0);
    const status = (r.status ?? 'pending') as OrderRow['status'];
    const payment_method = (r.payment_method ?? r.paymentMethod ?? 'whatsapp') as OrderRow['payment_method'];
    const rental_duration = r.rental_duration ? String(r.rental_duration) : r.rentalDuration ? String(r.rentalDuration) : null;
    const created_at = r.created_at ? String(r.created_at) : r.createdAt ? String(r.createdAt) : new Date().toISOString();

    return {
      id,
      product_id,
      product_name,
      customer_name,
      customer_email,
      customer_phone,
      order_type,
      amount,
      status,
      payment_method,
      rental_duration,
      created_at};
  };

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      // Build query parameters for pagination and filtering
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()});

      // Add filters if they're not 'all'
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (orderTypeFilter !== 'all') {
        params.append('order_type', orderTypeFilter);
      }
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const url = `/api/admin?action=orders&${params.toString()}`;

      // Fetch orders from consolidated admin API endpoint
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
        }});

      // Check if response is ok before proceeding
      if (!response.ok) {
        const statusText = response.statusText || 'Unknown error';
        throw new Error(`HTTP ${response.status}: ${statusText}`);
      }

      // Check content type to ensure we have JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check API endpoint.');
      }

      // Safely parse JSON response
      let result: Record<string, unknown>;
      try {
        result = await response.json() as Record<string, unknown>;
      } catch (jsonError) {
        throw new Error('Server returned invalid JSON. Please check server logs.');
      }

      // Check API response success
      if (!(result.success as boolean)) {
        const errorMsg = (result.error as string) || 'Failed to fetch orders';
        throw new Error(errorMsg);
      }

      // Process successful response
      const data = result.data as Record<string, unknown>;
      const orders = (data.orders as Record<string, unknown>[]) || [];
      setRows(orders.map(mapRow));

      const pagination = data.pagination as Record<string, unknown>;
      setTotalOrders((pagination?.total as number) || 0);

      // Show warning if product relations couldn't be loaded
      if (result.warning) {
        setErrorMsg(result.warning as string);
      }

      const paginationData = data.pagination as Record<string, unknown>;
      const total = (paginationData?.total as number) || 0;

    } catch (e: unknown) {
      let errorMessage = 'Unknown error occurred';

      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      setErrorMsg(errorMessage);
      push(`Gagal memuat orders: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, statusFilter, orderTypeFilter, debouncedSearch, push]);

  useEffect(() => {
    void load();
  }, [currentPage, itemsPerPage, statusFilter, orderTypeFilter, debouncedSearch, load]);

  // Realtime updates: refresh periodically
  useEffect(() => {
    const interval = setInterval(() => {
      load().catch((error) => {
      });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentPage, itemsPerPage, statusFilter, orderTypeFilter, debouncedSearch, load]);

  // Since we're using server-side filtering and pagination, just use rows directly
  const filtered = rows;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan</h1>
          <p className="text-gray-600">Pantau dan kelola semua pesanan pelanggan</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-pink-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Pesanan</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cari</label>
            <input
              type="text"
              placeholder="ID, nama, email, telepon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all'|'pending'|'paid'|'completed'|'cancelled')}
              className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Order Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Jenis Order</label>
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value as 'all'|'purchase'|'rental')}
              className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">Semua Jenis</option>
              <option value="purchase">Pembelian</option>
              <option value="rental">Rental</option>
            </select>
          </div>
        </div>
        
        {/* Filter Summary and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Menampilkan {filtered.length} dari {rows.length} pesanan
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setOrderTypeFilter('all');
              }}
              title="Reset Filter"
              className="p-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => {
                load().catch((error) => {
                });
              }}
              title="Refresh Data"
              className="p-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        {errorMsg && (
          <div className="px-4 py-2 text-sm text-amber-300 bg-amber-900/30 border-b border-amber-500/30 rounded mb-4">
            {errorMsg.includes('permission') || errorMsg.includes('RLS') ? (
              <span>Akses dibatasi oleh RLS. Pastikan kebijakan RLS untuk tabel orders mengizinkan admin melihat semua data.</span>
            ) : (
              <span>{errorMsg}</span>
            )}
          </div>
        )}
        
        {loading ? (
          <div className="p-4 text-center" style={{color: '#ffffff'}}>Memuat…</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center" style={{color: '#ffffff'}}>
            Belum ada order{statusFilter !== 'all' ? ` dengan status ${statusFilter}` : ''}.
          </div>
        ) : (
          <div style={{background: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px', overflow: 'hidden'}}>
            {/* Header */}
            <div style={{display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2.5fr 1fr 1fr', background: '#2a2a2a', borderBottom: '1px solid #333333'}}>
              <div style={{padding: '12px', color: '#ffffff', fontWeight: '600'}}>Customer</div>
              <div style={{padding: '12px', color: '#ffffff', fontWeight: '600'}}>WhatsApp</div>
              <div style={{padding: '12px', color: '#ffffff', fontWeight: '600'}}>Jenis</div>
              <div style={{padding: '12px', color: '#ffffff', fontWeight: '600'}}>Detail Produk</div>
              <div style={{padding: '12px', color: '#ffffff', fontWeight: '600'}}>Jumlah</div>
              <div style={{padding: '12px', color: '#ffffff', fontWeight: '600'}}>Status</div>
            </div>
            
            {/* Rows */}
            {filtered.map((r) => (
              <div key={r.id} style={{display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2.5fr 1fr 1fr', borderBottom: '1px solid #333333', background: '#1a1a1a'}} className="hover:bg-gray-800">
                <div style={{padding: '12px', color: '#ffffff'}}>
                  <div style={{fontWeight: '500'}}>{r.customer_name}</div>
                  <div style={{fontSize: '12px', color: '#999999'}}>{r.customer_email}</div>
                </div>
                <div style={{padding: '12px', color: '#ffffff'}}>
                  <div style={{fontSize: '14px'}}>{r.customer_phone || '-'}</div>
                </div>
                <div style={{padding: '12px', color: '#ffffff'}}>
                  <div style={{textTransform: 'capitalize'}}>{r.order_type}</div>
                  {r.rental_duration && (
                    <div style={{fontSize: '12px', color: '#999999'}}>{r.rental_duration}</div>
                  )}
                </div>
                <div style={{padding: '12px', color: '#ffffff'}}>
                  <div style={{fontSize: '14px', fontWeight: '600'}}>{r.product_name || 'Produk'}</div>
                  <div style={{fontSize: '12px', color: '#999999'}}>Order #{r.id.slice(0, 8)}</div>
                  {r.product_id && (
                    <div style={{marginTop: '4px'}}>
                      <a href={`/products/${r.product_id}`} target="_blank" rel="noreferrer" className="text-pink-400 hover:underline">
                        Lihat Produk
                      </a>
                    </div>
                  )}
                </div>
                <div style={{padding: '12px', color: '#ffffff', fontWeight: '500'}}>Rp {Number(r.amount || 0).toLocaleString('id-ID')}</div>
                <div style={{padding: '12px'}}>
                  <AdminPillBadge 
                    variant={
                      r.status === 'pending' ? 'warning' :
                      r.status === 'paid' ? 'success' :
                      r.status === 'completed' ? 'info' :
                      r.status === 'cancelled' ? 'danger' :
                      'secondary'
                    }
                  >
                    {r.status}
                  </AdminPillBadge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        <div className="pagination mt-6">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{color: '#ffffff'}}>
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai {Math.min(currentPage * itemsPerPage, totalOrders)} dari {totalOrders} order
            </div>
            <div style={{display: 'flex', gap: '8px'}}>
              <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="admin-select"
                style={{width: 'auto'}}
              >
                <option value={20}>20 per halaman</option>
                <option value={50}>50 per halaman</option>
                <option value={100}>100 per halaman</option>
              </select>
              
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="pagination button"
                style={{
                  background: currentPage <= 1 ? '#1a1a1a' : '#2a2a2a',
                  color: currentPage <= 1 ? '#666666' : '#ffffff',
                  border: '1px solid #444444',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Sebelumnya
              </button>
              
              <span style={{color: '#ffffff', padding: '8px 12px'}}>
                Halaman {currentPage} dari {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="pagination button"
                style={{
                  background: currentPage >= totalPages ? '#1a1a1a' : '#2a2a2a',
                  color: currentPage >= totalPages ? '#666666' : '#ffffff',
                  border: '1px solid #444444',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
