"use client";

import DashboardLayout from "@/components/dashboard/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Clock,
  ThumbsUp,
  Users,
} from "lucide-react";
import { sampleAnalytics } from "@/lib/sample-data";

export default function AnalyticsPage() {
  const formatChange = (change: number) => {
    const isPositive = change > 0;
    return (
      <span
        className={`flex items-center text-sm ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-4 w-4 mr-1" />
        ) : (
          <TrendingDown className="h-4 w-4 mr-1" />
        )}
        {Math.abs(change)}%
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto p-6 bg-black">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-neutral-400">
              Track your communication metrics and team performance
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Total Messages
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-neutral-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sampleAnalytics.totalMessages.toLocaleString()}
                </div>
                {formatChange(sampleAnalytics.messageGrowth)}
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Active Conversations
                </CardTitle>
                <Users className="h-4 w-4 text-neutral-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sampleAnalytics.activeConversations}
                </div>
                {formatChange(sampleAnalytics.conversationGrowth)}
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Avg Response Time
                </CardTitle>
                <Clock className="h-4 w-4 text-neutral-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sampleAnalytics.avgResponseTime}
                </div>
                {formatChange(sampleAnalytics.responseTimeChange)}
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Satisfaction Rate
                </CardTitle>
                <ThumbsUp className="h-4 w-4 text-neutral-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sampleAnalytics.satisfactionRate}%
                </div>
                {formatChange(sampleAnalytics.satisfactionChange)}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Distribution */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle>Channel Distribution</CardTitle>
                <CardDescription className="text-neutral-400">
                  Messages by communication channel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleAnalytics.channelDistribution.map((channel) => (
                  <div key={channel.channel}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {channel.channel}
                      </span>
                      <span className="text-sm text-neutral-400">
                        {channel.count} ({channel.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          channel.channel === "WhatsApp"
                            ? "bg-green-500"
                            : channel.channel === "Email"
                            ? "bg-blue-500"
                            : "bg-purple-500"
                        }`}
                        style={{ width: `${channel.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Messages by Day */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle>Messages by Day</CardTitle>
                <CardDescription className="text-neutral-400">
                  Daily message volume for the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleAnalytics.messagesByDay.map((day) => (
                    <div key={day.day} className="flex items-center">
                      <div className="w-12 text-sm text-neutral-400">
                        {day.day}
                      </div>
                      <div className="flex-1 flex items-center space-x-2">
                        <div className="flex-1 bg-neutral-800 rounded-full h-2">
                          <div
                            className="bg-white h-2 rounded-full"
                            style={{
                              width: `${(day.count / 500) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="w-12 text-sm font-medium text-right">
                          {day.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Contacts */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle>Top Contacts</CardTitle>
              <CardDescription className="text-neutral-400">
                Most active conversations this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleAnalytics.topContacts.map((contact, index) => (
                  <div
                    key={contact.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-neutral-400 font-medium w-6">
                        #{index + 1}
                      </div>
                      <Avatar className="h-10 w-10 bg-white text-black">
                        <div className="flex items-center justify-center h-full text-sm font-semibold">
                          {contact.avatar}
                        </div>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-neutral-400">
                          {contact.messages} messages
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 max-w-xs mx-4">
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                          className="bg-white h-2 rounded-full"
                          style={{
                            width: `${(contact.messages / 100) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
