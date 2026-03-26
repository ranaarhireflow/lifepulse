import { useEffect, useState } from "react"

type Theme = "dark" | "light"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored) return stored
    return "dark" // Dark mode is the default in v2
  })

  useEffect(() => {
    const root = document.documentElement
    // Dark is default (:root CSS). Light mode adds .light class.
    root.classList.toggle("light", theme === "light")
    root.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

  return { theme, setTheme, toggleTheme }
}
