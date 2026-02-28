"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, LogOut } from "lucide-react";

export default function UserSidebar() {
  const router = useRouter();

  // Logout function
  const handleLogout = async () => {
    try {
      // Call Next.js API route for logout
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      // Redirect to login page
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="w-64 bg-white border-r flex flex-col justify-between fixed h-full">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">User</h1>
        <nav className="space-y-2">

          <Link href="/admin" className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg transition font-medium">
            <RefreshCw size={20} /> Switch to Admin
          </Link>

        </nav>
      </div>

      <div className="p-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-gray-800 hover:text-red-500 transition w-full font-medium"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}