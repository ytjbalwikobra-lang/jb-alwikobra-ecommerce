import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../components/Toast.tsx';
import { RefreshCw, Filter } from 'lucide-react';

type OrderRow = {
  id: string;
  product_id: string | null;
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
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'paid'|'completed'|'cancelled'>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all'|'purchase'|'rental'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
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
  }, [statusFilter, orderTypeFilter, searchTerm, itemsPerPage]);

  const mapRow = (r: any): OrderRow => ({
    id: r.id,
    product_id: r.product_id ?? r.productId ?? null,
    customer_name: r.customer_name ?? r.customerName ?? r.customer?.name ?? 'Unknown',
    customer_email: r.customer_email ?? r.customerEmail ?? r.customer?.email ?? '',
    customer_phone: r.customer_phone ?? r.customerPhone ?? r.customer?.phone ?? '',
    order_type: r.order_type ?? r.orderType ?? 'purchase',
    amount: Number(r.amount ?? 0),
    status: (r.status ?? 'pending') as OrderRow['status'],
    payment_method: r.payment_method ?? r.paymentMethod ?? 'whatsapp',
    rental_duration: r.rental_duration ?? r.rentalDuration ?? null,
    created_at: r.created_at ?? r.createdAt ?? new Date().toISOString(),
  });

  const load = async () => {
    setLoading(true); setErrorMsg('');
    try {
      // Build query parameters for pagination and filtering
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      // Add filters if they're not 'all'
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (orderTypeFilter !== 'all') {
        params.append('order_type', orderTypeFilter);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      // Fetch orders from consolidated admin API endpoint
      const response = await fetch(`/api/admin?action=orders&${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch orders');
      }
      
      setRows((result.data.orders || []).map(mapRow));
      setTotalOrders(result.data.pagination?.total || 0);
      
      // Show warning if product relations couldn't be loaded
      if (result.warning) {
        setErrorMsg(result.warning);
      }

      console.log(`✅ Loaded ${result.data.orders?.length || 0} orders (page ${currentPage}/${Math.ceil((result.data.pagination?.total || 0) / itemsPerPage)}) - Total: ${result.data.pagination?.total || 0}`);
    } catch (e: any) {
      const m = e?.message || String(e);
      setErrorMsg(m);
      push(`Gagal memuat orders: ${m}`, 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { 
    load(); 
  }, [currentPage, itemsPerPage, statusFilter, orderTypeFilter, searchTerm]);
  
  // Realtime updates: refresh periodically
  useEffect(() => {
    const interval = setInterval(() => {
      load();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [currentPage, itemsPerPage, statusFilter, orderTypeFilter, searchTerm]);

  // Since we're using server-side filtering and pagination, just use rows directly
  const filtered = rows as OrderRow[];

  const updateStatus = async (id: string, status: OrderRow['status']) => {
    try {
      const response = await fetch('/api/admin?action=update-order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update order');
      }

      push('Status diperbarui', 'success');
      await load();
    } catch (e: any) {
      push(`Gagal memperbarui status: ${e.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan</h1>
          <p className="text-gray-600">Pantau dan kelola semua pesanan pelanggan</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-gray-900 border border-pink-500/30 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-pink-500" />
          <h3 className="text-lg font-semibold text-white">Filter Pesanan</h3>
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
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select 
              value={statusFilter} 
              onChange={e=>setStatusFilter(e.target.value as any)} 
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
              onChange={e=>setOrderTypeFilter(e.target.value as any)} 
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
            >
              Reset Filter
            </button>
            <button 
              onClick={load} 
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 text-sm"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-3 shadow-sm">
        {errorMsg && (
          <div className="px-4 py-2 text-sm text-amber-700 bg-amber-50 border-b border-amber-200">
            {errorMsg.includes('permission') || errorMsg.includes('RLS') ? (
              <span>Akses dibatasi oleh RLS. Pastikan kebijakan RLS untuk tabel orders mengizinkan admin melihat semua data.</span>
            ) : (
              <span>{errorMsg}</span>
            )}
          </div>
        )}
        <div className="grid grid-cols-12 text-xs uppercase text-gray-500 px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="col-span-3 font-medium">Customer</div>
          <div className="col-span-2 font-medium">Jenis</div>
          <div className="col-span-2 font-medium">Jumlah</div>
          <div className="col-span-2 font-medium">Status</div>
          <div className="col-span-3 text-right font-medium">Aksi</div>
        </div>
        {loading ? (
          <div className="p-4 text-gray-500">Memuat…</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-gray-500">Belum ada order{statusFilter!=='all' ? ` dengan status ${statusFilter}` : ''}.</div>
        ) : filtered.map((r) => (
          <div key={r.id} className="grid grid-cols-12 items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
            <div className="col-span-3 text-gray-900">
              <div className="font-medium">{r.customer_name}</div>
              <div className="text-xs text-gray-500">{r.customer_email} · {r.customer_phone}</div>
            </div>
            <div className="col-span-2 text-gray-700">
              <div className="capitalize">{r.order_type}</div>
              {/* Product quick link when available */}
              {((r as any).products || r.product_id) && (
                <div className="mt-1 text-xs">
                  <a
                    href={`/products/${(r as any).products?.id || r.product_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-500 hover:text-pink-600 underline decoration-dotted"
                    title={(r as any).products?.name || 'Lihat produk'}
                  >
                    {(r as any).products?.name || 'Buka produk'}
                  </a>
                </div>
              )}
            </div>
            <div className="col-span-2 text-gray-700 font-medium">Rp {Number(r.amount||0).toLocaleString('id-ID')}</div>
            <div className="col-span-2">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                r.status === 'paid' ? 'bg-green-100 text-green-800' :
                r.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                r.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {r.status}
              </span>
            </div>
            <div className="col-span-3 text-right">
              <select 
                value={r.status} 
                onChange={(e)=>updateStatus(r.id, e.target.value as any)} 
                className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="pending">pending</option>
                <option value="paid">paid</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination component (copied from AdminProducts) */}
      {!loading && totalPages > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Items per halaman</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-300 rounded px-3 py-1 text-gray-900 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalOrders)} dari {totalOrders.toLocaleString()} orders
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Sebelumnya
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  
                  if (page < 1 || page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        page === currentPage
                          ? 'bg-pink-500 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
