"use client"

import { useState } from "react"
import Link from "next/link"
import { Bot, Wrench, MessageSquare, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/layout/top-bar"
import { getAll } from "@/lib/agents/store"

const baseStats = [
  { label: "Agents", icon: Bot, href: "/agents" },
  { label: "Skills", count: 0, icon: Wrench, href: "/skills" },
  { label: "Prompts", count: 0, icon: MessageSquare, href: "/prompts" },
]

const quickActions = [
  { label: "Create Agent", href: "/agents/new" },
  { label: "Create Skill", href: "/skills/new" },
  { label: "Create Prompt", href: "/prompts/new" },
]

export default function DashboardPage() {
  const [stats] = useState(() =>
    baseStats.map((s) =>
      s.label === "Agents" ? { ...s, count: getAll().length } : s
    )
  )

  return (
    <>
      <TopBar title="Dashboard" />

      <div className="px-6 py-6 flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Link key={stat.href} href={stat.href}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.href}
                variant="outline"
                render={<Link href={action.href} />}
                nativeButton={false}
              >
                <Plus data-icon="inline-start" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No recent activity
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
