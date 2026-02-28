"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, History, RefreshCw, LogOut } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Function to check which menu is Active
  const isActive = (path: string) => pathname === path;

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
        <h1 className="text-2xl font-bold mb-8 text-gray-900">Admin</h1>
        <nav className="space-y-2">

          <Link
            href="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              isActive("/admin")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Home size={20} /> Home
          </Link>

          <Link
            href="/admin/history"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              isActive("/admin/history")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <History size={20} /> History
          </Link>

            <Link
            href="/user"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              isActive("/user")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <RefreshCw size={20} /> Switch to user
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