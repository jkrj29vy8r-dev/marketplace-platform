import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-24 text-center sm:pt-40">
      <div
        aria-hidden
        className="absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-accent-violet/20 blur-3xl"
      />
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-widest text-accent-cyan">
        Intermediation, automated
      </span>
      <h1 className="mx-auto mt-8 max-w-3xl font-display text-5xl font-medium leading-tight sm:text-6xl">
        The fastest path from a request to a deal.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
        Nexar matches buyers and providers in real time, escrows the
        payment, and releases funds the moment the deal closes — minus a
        transparent commission.
      </p>
      <div className="mt-10 flex items-center justify-center gap-4">
        <Link href="/signup">
          <Button>Start matching</Button>
        </Link>
        <Link href="#live-stats">
          <Button variant="outline">See how it works</Button>
        </Link>
      </div>
    </section>
  );
}
