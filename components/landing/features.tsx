import { MessageSquare, Wrench, Bot } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const features = [
  {
    title: "Prompt Generator",
    description: "Describe what you need in natural language. Get production-ready prompts.",
    icon: MessageSquare,
  },
  {
    title: "Skill Generator",
    description: "Create reusable AI skills with instructions, tools, and rules.",
    icon: Wrench,
  },
  {
    title: "Agent Builder",
    description: "Build complete agents with models, tools, skills, and context.",
    icon: Bot,
  },
]

export function Features(): React.ReactNode {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-heading font-semibold text-center text-foreground mb-12">
          Everything you need to build AI agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="size-6 text-muted-foreground" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
