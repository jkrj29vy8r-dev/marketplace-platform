"use client";

import { useCallback, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  blocked: boolean;
  createdAt: string;
}

export function UsersPanel() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const { users } = await res.json();
      setUsers(users);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function toggleBlock(user: UserRecord) {
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: !user.blocked }),
    });
    refresh();
  }

  async function remove(user: UserRecord) {
    if (!confirm(`Delete account for ${user.email}?`)) return;
    await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    refresh();
  }

  if (loading) return <p className="text-sm text-white/40">Loading users…</p>;

  return (
    <GlassCard className="p-6">
      <h2 className="font-display text-lg">Users</h2>
      <div className="mt-4 space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">
                {user.name} <span className="text-white/30">· {user.role}</span>
              </p>
              <p className="text-xs text-white/40">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {user.blocked && <span className="text-xs text-accent-danger">Blocked</span>}
              <Button variant="outline" className="px-3 py-1 text-xs" onClick={() => toggleBlock(user)}>
                {user.blocked ? "Unblock" : "Block"}
              </Button>
              <Button variant="ghost" className="px-3 py-1 text-xs text-accent-danger" onClick={() => remove(user)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-sm text-white/40">No users yet.</p>}
      </div>
    </GlassCard>
  );
}
