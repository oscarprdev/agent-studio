"use client"

import { Home, Bot, Wrench, MessageSquare, Plug, Store, Settings } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SidebarNavItem } from "./sidebar-nav-item"
import { UserMenu } from "./user-menu"

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Skills", href: "/skills", icon: Wrench },
  { label: "Prompts", href: "/prompts", icon: MessageSquare },
  { label: "MCP Connections", href: "/mcp", icon: Plug },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  return (
    <div className="hidden md:flex md:w-60 md:fixed md:inset-y-0 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo section */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex items-center justify-center size-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
          AI
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground truncate">
          AI Agent Studio
        </span>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation section */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </div>
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User section */}
      <UserMenu />
    </div>
  )
}
