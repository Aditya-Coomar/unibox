"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Mail,
  Phone,
} from "lucide-react";

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
  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <Badge
          variant="secondary"
          className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
        >
          Last 7 days
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.totalMessages.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              +{analyticsData.todayMessages} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Conversations
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.totalConversations}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Active conversations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.avgResponseTime}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              ↓ 15% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Growth Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              +23%
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              ↑ Message volume
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
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
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {channel.channel}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {channel.count} messages
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {channel.percentage}%
                    </div>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
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
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
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
                    <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                      {day.date}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
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
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">94%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Response Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">4.8</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">12.5min</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Resolution Time
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
