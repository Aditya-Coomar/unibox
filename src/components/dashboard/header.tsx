"use client";

import {
  Menu,
  Search,
  Bell,
  Settings,
  Shield,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out");
    }
  };

  // Show loading state while session is being fetched
  if (isPending) {
    return (
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" disabled>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            UniBox
          </h1>
        </div>
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Loading..."
              disabled
              className="pl-10 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
      </header>
    );
  }

  // If no session, redirect to login (this shouldn't happen due to middleware)
  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const user = session.user;

  // Helper function to get role badge color
  const getRoleBadgeVariant = (role?: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "destructive";
      case "EDITOR":
        return "default";
      case "VIEWER":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          UniBox
        </h1>
      </div>

      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search conversations..."
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name || user.email}
                />
                <AvatarFallback className="bg-blue-600 text-white">
                  {(user.name || user.email)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            align="end"
          >
            <DropdownMenuLabel className="text-gray-900 dark:text-white">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name || "User"}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
