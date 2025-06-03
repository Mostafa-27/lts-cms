import { Moon, Sun } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/ui/theme-provider"

interface ThemeToggleProps {
  showLabel?: boolean
  className?: string
}

export function ThemeToggle({ 
  showLabel = false,
  className
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle theme"
      />
      {showLabel && (
        <div className="flex items-center gap-2">
          {theme === "dark" ? (
            <>
              <Moon size={16} className="flex-shrink-0" />
              <span className="whitespace-nowrap text-sm">Dark mode</span>
            </>
          ) : (
            <>
              <Sun size={16} className="flex-shrink-0" />
              <span className="whitespace-nowrap text-sm">Light mode</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
