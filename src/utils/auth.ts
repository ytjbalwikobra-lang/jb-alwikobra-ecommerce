export type UserRole = 'guest' | 'admin' | 'super_admin';

export function getUserRole(): UserRole {
  const stored = localStorage.getItem('user_role');
  if (stored === 'admin' || stored === 'super_admin') return stored;
  return 'guest';
}

export function isAdmin(): boolean {
  const role = getUserRole();
  return role === 'admin' || role === 'super_admin';
}
