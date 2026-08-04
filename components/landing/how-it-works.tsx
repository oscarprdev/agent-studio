import { MessageSquareText, Sparkles, Rocket } from "lucide-react"

const steps = [
  {
    step: "1",
    title: "Describe",
    description: "Tell AI what you want to build",
    icon: MessageSquareText,
  },
  {
    step: "2",
    title: "Generate",
    description: "AI creates prompts, skills, and agents",
    icon: Sparkles,
  },
  {
    step: "3",
    title: "Deploy",
    description: "Export, save, and use your agents",
    icon: Rocket,
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>

        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-12 md:gap-8">
          {steps.map((step) => (
            <div
              key={step.step}
              className="flex flex-col items-center text-center max-w-[280px]"
            >
              <div className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                {step.step}
              </div>

              <step.icon className="mt-4 size-8 text-muted-foreground" />

              <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
