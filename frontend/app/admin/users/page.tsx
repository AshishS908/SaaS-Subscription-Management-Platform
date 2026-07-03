'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User { id: number; email: string; name: string; role: 'user' | 'admin'; created_at: string; }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  function loadUsers() { api.get('/admin/users').then((res) => setUsers(res.data.users)); }
  useEffect(() => { loadUsers(); }, []);

  async function toggleRole(user: User) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await api.patch(`/admin/users/${user.id}/role`, { role: newRole });
    loadUsers();
  }

  return (
    <div>
      <h1>Users</h1>
      <table width="100%" cellPadding={8}>
        <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}><th>Email</th><th>Name</th><th>Role</th><th>Joined</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td><td>{u.name}</td><td>{u.role}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td><button onClick={() => toggleRole(u)}>Make {u.role === 'admin' ? 'user' : 'admin'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
