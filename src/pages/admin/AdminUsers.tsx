import React, { useEffect, useState } from 'react';
import { getAuthUserId } from '../../services/authService';
import { useToast } from '../../components/Toast';
import { RefreshCw, Search, User, Shield, Clock } from 'lucide-react';

type ProfileRow = { 
  id: string; 
  name: string | null; 
  is_admin: boolean;
  email?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
  phone_verified?: boolean;
  is_active?: boolean;
  // Computed field for compatibility
  role?: string;
};

const AdminUsers: React.FC = () => {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [authUsers, setAuthUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { push } = useToast();

  const load = async () => {
    try {
      // Fetch users from consolidated admin API endpoint
      const response = await fetch('/api/admin?action=users');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users');
      }
      
      const usersData = result.data || [];
      
      // Transform the data to match the ProfileRow interface
      const transformedRows: ProfileRow[] = usersData.map((user: any) => ({
        id: user.id,
        name: user.name,
        is_admin: user.is_admin || false,
        email: user.email || '',
        phone: user.phone || '',
        is_active: user.is_active || true,
        phone_verified: user.phone_verified || false,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
        last_login_at: user.last_login_at || null
      }));
      
      setRows(transformedRows);
    } catch (e: any) {
      const msg = e?.message || String(e);
      console.error('Load users error:', e);
      push(`Gagal memuat users: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };  useEffect(() => { 
    (async()=>{ 
      setUid(await getAuthUserId()); 
      await load(); 
    })(); 
  }, []);

  const filteredRows = rows.filter(row => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (row.name && row.name.toLowerCase().includes(searchLower)) ||
        (row.email && row.email.toLowerCase().includes(searchLower)) ||
        (row.phone && row.phone.includes(searchTerm)) ||
        row.id.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Role filter
    if (roleFilter !== 'all') {
      if (row.role !== roleFilter) return false;
    }
    
    return true;
  });

  const updateRole = async (id: string, role: string) => {
    try {
      // Prevent demoting the last admin (including 'super admin'/'owner')
      const normalized = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
      const adminSet = new Set(['admin','superadmin','super-admin','super admin','owner']);
      const isAdminRole = (r: string) => adminSet.has(normalized(r));
      const current = rows.find(r=>r.id===id);
      if (current && current.role && isAdminRole(current.role) && !isAdminRole(role)) {
        const adminCount = rows.filter(r=> r.role && isAdminRole(r.role)).length;
        if (adminCount <= 1 && uid === id) {
          alert('Tidak bisa menurunkan peran: ini adalah admin terakhir. Tambahkan admin lain terlebih dahulu.');
          return;
        }
      }
      
      // Update user role via consolidated admin API
      const isAdmin = isAdminRole(role);
      const response = await fetch('/api/admin?action=users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isAdmin }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update user role');
      }

      push('Peran diperbarui', 'success');
      await load();
    } catch (e: any) {
      push(`Gagal memperbarui peran: ${e.message}`, 'error');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const normalized = role.toLowerCase();
    if (normalized.includes('owner') || normalized.includes('super')) return 'bg-purple-900/50 text-purple-300 border-purple-600/40';
    if (normalized.includes('admin')) return 'bg-red-900/50 text-red-300 border-red-600/40';
    return 'bg-gray-900/50 text-gray-300 border-gray-600/40';
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users & Roles</h1>
          <p className="text-gray-400">Kelola pengguna dan peran dalam sistem</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-black/60 border border-pink-500/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={20} className="text-pink-400" />
          <h3 className="text-lg font-semibold text-white">Filter Pengguna</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cari Pengguna</label>
            <input
              type="text"
              placeholder="Nama, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-pink-500/40 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter Peran</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-pink-500/40 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">Semua Peran</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super admin">Super Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 pt-4 border-t border-pink-500/20">
          Menampilkan {filteredRows.length} dari {rows.length} pengguna
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-black/60 border border-pink-500/30 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 text-xs uppercase text-gray-400 px-4 py-3 border-b border-pink-500/20">
          <div className="col-span-3">Pengguna</div>
          <div className="col-span-2">Kontak</div>
          <div className="col-span-2">Peran</div>
          <div className="col-span-2">Bergabung</div>
          <div className="col-span-2">Last Login</div>
          <div className="col-span-1 text-right">Aksi</div>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-gray-400">
            <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
            Memuat data pengguna...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            {rows.length === 0 ? (
              <>
                <User className="mx-auto mb-2" size={24} />
                Belum ada data pengguna.
              </>
            ) : (
              <>
                <Search className="mx-auto mb-2" size={24} />
                Tidak ada pengguna yang sesuai dengan filter.
              </>
            )}
          </div>
        ) : (
          filteredRows.map((r) => (
            <div key={r.id} className="grid grid-cols-12 items-center px-4 py-4 border-b border-pink-500/10 hover:bg-white/5">
              {/* User Info */}
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{r.name || 'Unnamed User'}</div>
                    <div className="text-xs text-gray-500 font-mono">{r.id.substring(0, 8)}...</div>
                  </div>
                </div>
              </div>
              
              {/* Contact */}
              <div className="col-span-2">
                <div className="text-sm">
                  {r.email && (
                    <div className="text-gray-300 flex items-center gap-1">
                      <span>{r.email}</span>
                      {r.phone_verified && (
                        <Shield size={12} className="text-green-400" />
                      )}
                    </div>
                  )}
                  {r.phone && (
                    <div className="text-gray-400 text-xs">{r.phone}</div>
                  )}
                  {!r.email && !r.phone && (
                    <div className="text-gray-500 text-xs">No contact info</div>
                  )}
                </div>
              </div>
              
              {/* Role */}
              <div className="col-span-2">
                <span className={`px-2 py-1 rounded text-xs border ${getRoleBadgeColor(r.role || 'user')}`}>
                  {r.role || 'user'}
                </span>
              </div>
              
              {/* Created At */}
              <div className="col-span-2 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatDate(r.created_at)}
                </div>
              </div>
              
              {/* Last Login */}
              <div className="col-span-2 text-sm text-gray-300">
                {r.last_login_at ? (
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(r.last_login_at)}
                  </div>
                ) : (
                  <span className="text-gray-500">Never</span>
                )}
              </div>
              
              {/* Actions */}
              <div className="col-span-1 text-right">
                <select
                  value={r.role}
                  onChange={(e)=>updateRole(r.id, e.target.value)}
                  className="bg-black border border-white/20 rounded px-2 py-1 text-white text-sm hover:bg-white/5"
                  title="Change user role"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                  <option value="super admin">super admin</option>
                  <option value="owner">owner</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: rows.length, icon: User },
          { label: 'Admins', value: rows.filter(r => r.role && r.role.toLowerCase().includes('admin')).length, icon: Shield },
          { label: 'Active Today', value: rows.filter(r => r.last_login_at && new Date(r.last_login_at) > new Date(Date.now() - 24*60*60*1000)).length, icon: Clock },
          { label: 'Verified', value: rows.filter(r => r.phone_verified).length, icon: Shield }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-black/60 border border-pink-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center">
                  <Icon size={20} className="text-pink-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminUsers;
