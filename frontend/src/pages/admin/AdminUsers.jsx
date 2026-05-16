import { useEffect, useState } from 'react';
import api from '@/api/client';

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get('/admin/users').then((res) => setRows(res.data.data || []));
  }, []);

  async function setRole(id, role) {
    await api.patch(`/admin/users/${id}/role`, { role });
    const res = await api.get('/admin/users');
    setRows(res.data.data || []);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Users</h1>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-200 dark:border-ink-800">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u._id} className="border-b border-ink-100 dark:border-ink-800/80">
              <td className="py-2">{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => setRole(u._id, e.target.value)}
                  className="rounded border px-2 py-1 dark:border-ink-700 dark:bg-ink-950"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
