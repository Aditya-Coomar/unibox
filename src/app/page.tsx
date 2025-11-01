"use client";

import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Zap,
  BarChart3,
  Users,
  Shield,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-800 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-xl font-bold">UniBox</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="#integrations"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Integrations
              </Link>
              <Link
                href="#pricing"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link href="/login">
                <Button className="bg-white text-black hover:bg-neutral-200">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="md:hidden">
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-neutral-200"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 mb-8">
            <Zap className="h-4 w-4 text-white" />
            <span className="text-sm text-neutral-300">
              Unified Communication Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            All Your Customer
            <br />
            <span className="text-neutral-400">Communications</span>
            <br />
            In One Place
          </h1>

          <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
            Manage SMS, WhatsApp, and Email from a single unified inbox.
            Streamline your team's communication and never miss a message.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-neutral-200 w-full sm:w-auto"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-neutral-800 hover:bg-neutral-900 w-full sm:w-auto"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-neutral-400">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-neutral-400">Messages/day</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50ms</div>
              <div className="text-neutral-400">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 border-t border-neutral-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-neutral-400">
              Powerful features to streamline your communication workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-colors">
              <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Unified Inbox</h3>
              <p className="text-neutral-400">
                All your messages from SMS, WhatsApp, and Email in one beautiful
                interface.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-colors">
              <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Sync</h3>
              <p className="text-neutral-400">
                Instant message updates across all channels with real-time
                notifications.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-colors">
              <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Team Collaboration</h3>
              <p className="text-neutral-400">
                Collaborate with your team using shared notes and role-based
                access control.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-colors">
              <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Analytics Dashboard</h3>
              <p className="text-neutral-400">
                Track engagement metrics, response times, and conversion
                funnels.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-colors">
              <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
              <p className="text-neutral-400">
                Bank-level encryption and SOC 2 compliance to keep your data
                safe.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-colors">
              <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Coverage</h3>
              <p className="text-neutral-400">
                Send messages worldwide with support for 180+ countries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section
        id="integrations"
        className="py-20 px-4 sm:px-6 lg:px-8 border-t border-neutral-900"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Integrations
          </h2>
          <p className="text-xl text-neutral-400 mb-16">
            Connect with the tools you already use
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              "Twilio",
              "WhatsApp",
              "Gmail",
              "Outlook",
              "Slack",
              "HubSpot",
              "Zapier",
              "Salesforce",
            ].map((integration) => (
              <div
                key={integration}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 hover:border-neutral-700 transition-colors"
              >
                <div className="text-lg font-semibold">{integration}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-neutral-400 mb-12">
            Join thousands of teams using UniBox to streamline their
            communication
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-neutral-200"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-6 w-6" />
                <span className="text-xl font-bold">UniBox</span>
              </div>
              <p className="text-neutral-400 text-sm">
                Unified communication platform for modern teams
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#integrations"
                    className="hover:text-white transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-8 text-center text-sm text-neutral-400">
            © 2025 UniBox. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
