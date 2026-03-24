import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "./ui/button"

export function ProjectCard({ title, description, link, github, image }: Readonly<{
  title: string
  description: string
  link: string
  github: string
  image: string
}>) {
  return (
    <Card className="">
      <div className="" />
      <img
        src={image}
        alt="Project Image"
        className=""
      />
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full">Visit site</Button>
        <Button className="w-full">View Project</Button>
      </CardFooter>
    </Card>

  )
}