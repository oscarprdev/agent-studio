import { Sparkles } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 via-background to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center sm:py-32 md:py-40">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          Build production AI agents faster.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Generate prompts, skills and agents with automatic context engineering.
        </p>
        <Link
          href="/agents/new"
          className={buttonVariants({ size: "lg" })}
        >
          <Sparkles data-icon="inline-start" />
          Create Agent
        </Link>
      </div>
    </section>
  )
}

export { Hero }
