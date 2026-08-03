"use client"

interface TopBarProps {
  title: string
  actions?: React.ReactNode
}

export function TopBar({ title, actions }: TopBarProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background border-b border-border">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
