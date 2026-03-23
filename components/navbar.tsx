import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Button } from "./ui/button"

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-1 border-b bg-background/60 backdrop-blur-md">
      <div className="container mx-auto py-3">
        <NavigationMenu className="flex justify-between max-w-full">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/" className="text-xl font-bold">khine.dev</NavigationMenuLink>
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
              <NavigationMenuLink asChild>
                <Button>Resume</Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}