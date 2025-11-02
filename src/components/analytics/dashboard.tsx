"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Mail,
  Phone,
  Download,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

// Mock analytics data
const analyticsData = {
  totalMessages: 1247,
  totalConversations: 89,
  avgResponseTime: "2.5 min",
  todayMessages: 156,
  channelBreakdown: [
    { channel: "WhatsApp", count: 672, percentage: 54 },
    { channel: "Email", count: 398, percentage: 32 },
    { channel: "SMS", count: 177, percentage: 14 },
  ],
  dailyStats: [
    { date: "Mon", messages: 45, conversations: 12 },
    { date: "Tue", messages: 67, conversations: 18 },
    { date: "Wed", messages: 89, conversations: 22 },
    { date: "Thu", messages: 76, conversations: 19 },
    { date: "Fri", messages: 98, conversations: 25 },
    { date: "Sat", messages: 54, conversations: 14 },
    { date: "Sun", messages: 32, conversations: 8 },
  ],
};

const channelIcons = {
  WhatsApp: MessageSquare,
  Email: Mail,
  SMS: Phone,
};

const channelColors = {
  WhatsApp: "bg-green-500",
  Email: "bg-blue-500",
  SMS: "bg-purple-500",
};

export function AnalyticsDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export generation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create a simple CSV export
    const csvData = [
      ["Metric", "Value"],
      ["Total Messages", analyticsData.totalMessages],
      ["Total Conversations", analyticsData.totalConversations],
      ["Avg Response Time", analyticsData.avgResponseTime],
      ["Today Messages", analyticsData.todayMessages],
      ...analyticsData.channelBreakdown.map((ch) => [ch.channel, ch.count]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Track your communication metrics and performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-neutral-800 text-neutral-300 border-neutral-700"
          >
            Last 7 days
          </Badge>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            size="sm"
            className="bg-white text-black hover:bg-neutral-200"
          >
            <Download
              className={`h-4 w-4 mr-2 ${isExporting ? "animate-pulse" : ""}`}
            />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Total Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analyticsData.totalMessages.toLocaleString()}
            </div>
            <p className="text-xs text-neutral-400">
              +{analyticsData.todayMessages} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Conversations
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analyticsData.totalConversations}
            </div>
            <p className="text-xs text-neutral-400">Active conversations</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Avg Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analyticsData.avgResponseTime}
            </div>
            <p className="text-xs text-green-400">↓ 15% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Growth Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+23%</div>
            <p className="text-xs text-green-400">↑ Message volume</p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Channel Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData.channelBreakdown.map((channel) => {
              const Icon =
                channelIcons[channel.channel as keyof typeof channelIcons];
              return (
                <div
                  key={channel.channel}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        channelColors[
                          channel.channel as keyof typeof channelColors
                        ]
                      }`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {channel.channel}
                      </div>
                      <div className="text-xs text-neutral-400">
                        {channel.count} messages
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {channel.percentage}%
                    </div>
                    <div className="w-20 bg-neutral-700 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          channelColors[
                            channel.channel as keyof typeof channelColors
                          ]
                        }`}
                        style={{ width: `${channel.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Daily Activity */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Daily Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.dailyStats.map((day, index) => {
                const maxMessages = Math.max(
                  ...analyticsData.dailyStats.map((d) => d.messages)
                );
                const barWidth = (day.messages / maxMessages) * 100;

                return (
                  <div
                    key={day.date}
                    className="flex items-center justify-between"
                  >
                    <div className="w-12 text-sm text-neutral-400">
                      {day.date}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-neutral-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-white w-16 text-right">
                      {day.messages}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">94%</div>
              <div className="text-sm text-neutral-400">Response Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">4.8</div>
              <div className="text-sm text-neutral-400">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">12.5min</div>
              <div className="text-sm text-neutral-400">
                Avg Resolution Time
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
