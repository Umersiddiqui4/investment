"use client"

import { Button } from "@/components/ui/button"

interface RequestTabsProps {
  activeTab: "create" | "view"
  onTabChange: (tab: "create" | "view") => void
}

export function RequestTabs({ activeTab, onTabChange }: RequestTabsProps) {
  return (
    <div className="mb-8 flex gap-2 border-b border-border">
      <Button
        onClick={() => onTabChange("create")}
        variant={activeTab === "create" ? "default" : "ghost"}
        className={`px-4 py-2 font-medium transition-colors ${
          activeTab === "create"
            ? "border-b-2 border-primary text-white"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Create Request
      </Button>
      <Button
        onClick={() => onTabChange("view")}
        variant={activeTab === "view" ? "default" : "ghost"}
        className={`px-4 py-2 font-medium transition-colors ${
          activeTab === "view"
            ? "border-b-2 border-primary text-white"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        View All Requests
      </Button>
    </div>
  )
}
