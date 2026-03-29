"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import { cn } from "@/lib/utils";

type Slide = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  linkUrl: string | null;
};

export function HeroSlider({
  className,
  mode = "card",
}: {
  className?: string;
  mode?: "card" | "background";
}) {
  const { data } = useFetch<Slide[]>("/api/hero-slides");
  const slides = (data ?? []).filter((s) => !!s.imageUrl);

  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (slides.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(t);
  }, [slides.length]);

  React.useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  if (slides.length === 0) return null;
  const active = slides[index]!;

  const Wrapper = active.linkUrl ? Link : ("div" as any);
  const wrapperProps = active.linkUrl ? { href: active.linkUrl } : {};

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative overflow-hidden",
          mode === "card"
            ? "rounded-3xl border border-border/50 bg-muted/20 shadow-2xl shadow-primary/10"
            : "rounded-none border-0 bg-transparent shadow-none h-full w-full"
        )}
      >
        {mode === "card" && (
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-cyan-500/10" />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn("relative", mode === "background" && "absolute inset-0")}
          >
            <Wrapper {...wrapperProps} className={active.linkUrl ? "block" : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.imageUrl}
                alt={active.title ?? "SMC update"}
                className={cn(
                  "w-full object-cover",
                  mode === "card" ? "h-[280px] md:h-[360px]" : "absolute inset-0 h-full"
                )}
                loading="lazy"
              />

              {mode === "card" && (
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
                    {active.title && (
                      <p className="text-base font-semibold text-white md:text-lg">
                        {active.title}
                      </p>
                    )}
                    {active.subtitle && (
                      <p className="mt-1 text-sm text-white/80 line-clamp-2">
                        {active.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Wrapper>
          </motion.div>
        </AnimatePresence>

        {/* Dots only for card mode (no white animation in hero background) */}
        {mode === "card" && slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-all",
                  i === index ? "w-7 bg-white" : "bg-white/50 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

