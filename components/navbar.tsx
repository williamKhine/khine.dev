"use client"
import { useState, useEffect } from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Button } from "./ui/button"
import Link from "next/link"

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      // Hide navbar if scrolling down and scrolled past the hero section
      if (currentScrollY > lastScrollY && currentScrollY > (window.innerHeight - 61)) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      lastScrollY = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-md transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
    >
      <div className="container mx-auto py-3">
        <NavigationMenu className="flex justify-between max-w-full">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" className="text-xl">khine.dev</Link>
            </NavigationMenuItem>
          </NavigationMenuList>

          <NavigationMenuList className="space-x-8">
            <NavigationMenuItem>
              <NavigationMenuLink href="#projects" className="">Projects</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#experience" className="">Experience</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#contact" className="">Contact</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>

          <NavigationMenuList>
            <NavigationMenuItem>
              <Button>Resume</Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}