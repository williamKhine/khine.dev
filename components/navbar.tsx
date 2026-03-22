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
    <section id="navbar" className="border-b">
      <div className="container mx-auto py-2">
        <NavigationMenu className="flex justify-between max-w-full">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/" className="text-xl font-bold">William Khine</NavigationMenuLink>
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
              <NavigationMenuLink>
                <Button>Resume</Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </section>
  )
}