"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "./header";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "react-hot-toast";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Redirect to login if no session (backup to middleware)
  if (!isPending && !session?.user) {
    router.push("/login");
    return null;
  }

  // Show loading state
  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const user = session?.user;

  const navigation = [
    {
      name: "Messages",
      href: "/dashboard",
      icon: MessageSquare,
      current: pathname === "/dashboard",
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      current: pathname === "/dashboard/analytics",
    },
    {
      name: "Contacts",
      href: "/dashboard/contacts",
      icon: Users,
      current: pathname === "/dashboard/contacts",
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      current: pathname === "/dashboard/settings",
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out");
    }
  };

  return (
    <div className="h-screen flex bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 ${
          isCollapsed ? "md:w-16" : "md:w-64"
        } w-64 bg-neutral-900 border-r border-neutral-800 transition-all duration-300 ease-in-out flex flex-col`}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-800">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 shrink-0" />
            <span
              className={`text-xl font-bold transition-opacity duration-200 ${
                isCollapsed ? "hidden md:hidden" : "block"
              }`}
            >
              UniBox
            </span>
          </Link>
          <Button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
            variant="ghost"
            size="sm"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  item.current
                    ? "bg-white text-black"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span
                  className={`font-medium transition-opacity duration-200 whitespace-nowrap ${
                    isCollapsed ? "hidden md:hidden" : "block"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-neutral-800">
          <div
            className={`flex items-center space-x-3 mb-3 ${
              isCollapsed ? "md:justify-center" : ""
            }`}
          >
            <Avatar className="h-10 w-10 bg-blue-600 text-white shrink-0">
              <AvatarImage
                src={user?.image || undefined}
                alt={user?.name || user?.email || "User"}
              />
              <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                {user?.name || user?.email
                  ? (user.name || user.email)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div
              className={`flex-1 min-w-0 transition-opacity duration-200 ${
                isCollapsed ? "hidden md:hidden" : "block"
              }`}
            >
              <p className="text-sm font-medium truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className={`w-full border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white ${
              isCollapsed ? "md:px-2" : ""
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span
              className={`transition-opacity duration-200 ${
                isCollapsed ? "hidden md:hidden" : "ml-2"
              }`}
            >
              Logout
            </span>
          </Button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-neutral-800 bg-black flex items-center justify-between px-4">
          <div className="flex items-center space-x-4 flex-1">
            <Button onClick={() => setSidebarOpen(true)} className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-10 bg-neutral-900 border-neutral-800 focus:border-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button className="relative p-2 hover:bg-neutral-900 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-white rounded-full"></span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
