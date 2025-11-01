"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Bell,
  Shield,
  Smartphone,
  Mail,
  MessageSquare,
  Key,
  Palette,
} from "lucide-react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    whatsapp: true,
    desktop: true,
  });

  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto p-6 bg-black">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-neutral-400">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Settings */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
              <CardDescription className="text-neutral-400">
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    defaultValue="John"
                    className="bg-black border-neutral-800 focus:border-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    defaultValue="Doe"
                    className="bg-black border-neutral-800 focus:border-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john@example.com"
                  className="bg-black border-neutral-800 focus:border-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="bg-black border-neutral-800 focus:border-white"
                />
              </div>
              <Button className="bg-white text-black hover:bg-neutral-200">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription className="text-neutral-400">
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    <Label htmlFor="email-notif">Email Notifications</Label>
                  </div>
                  <p className="text-sm text-neutral-400">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notif"
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-neutral-400" />
                    <Label htmlFor="sms-notif">SMS Notifications</Label>
                  </div>
                  <p className="text-sm text-neutral-400">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  id="sms-notif"
                  checked={notifications.sms}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, sms: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-neutral-400" />
                    <Label htmlFor="whatsapp-notif">
                      WhatsApp Notifications
                    </Label>
                  </div>
                  <p className="text-sm text-neutral-400">
                    Receive notifications via WhatsApp
                  </p>
                </div>
                <Switch
                  id="whatsapp-notif"
                  checked={notifications.whatsapp}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, whatsapp: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-neutral-400" />
                    <Label htmlFor="desktop-notif">Desktop Notifications</Label>
                  </div>
                  <p className="text-sm text-neutral-400">
                    Show notifications on your desktop
                  </p>
                </div>
                <Switch
                  id="desktop-notif"
                  checked={notifications.desktop}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, desktop: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Channel Integrations */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Channel Integrations</CardTitle>
              </div>
              <CardDescription className="text-neutral-400">
                Manage your communication channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-neutral-800">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500/10 p-3 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp Business</p>
                    <p className="text-sm text-neutral-400">
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  Connected
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-neutral-800">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-neutral-400">john@example.com</p>
                  </div>
                </div>
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Connected
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-neutral-800">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500/10 p-3 rounded-lg">
                    <Smartphone className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Twilio SMS</p>
                    <p className="text-sm text-neutral-400">
                      +1 (555) 987-6543
                    </p>
                  </div>
                </div>
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  Connected
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription className="text-neutral-400">
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  className="bg-black border-neutral-800 focus:border-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  className="bg-black border-neutral-800 focus:border-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="bg-black border-neutral-800 focus:border-white"
                />
              </div>
              <Button className="bg-white text-black hover:bg-neutral-200">
                <Key className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription className="text-neutral-400">
                Customize how UniBox looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-neutral-400">
                    Currently using dark theme
                  </p>
                </div>
                <Badge className="bg-white text-black">Dark</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
