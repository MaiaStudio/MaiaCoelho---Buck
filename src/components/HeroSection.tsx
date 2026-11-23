"use client";

import { useEffect, useRef, useState } from "react";
import Antigravity from "@/components/Antigravity";
import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal";

const HERO_ANTIGRAVITY_COLORS = ["#FF5A1F", "#F1F0EB", "#A3A39E"];
const CONTACT_GLASS_TUNING = {
  dispersion: 1.25,
  colorBleed: 0.72,
  opticalDepth: 0.9,
  sheen: 1.15,
  startZoom: 1.85,
};

interface HeroSectionProps {
  onComplete?: () => void;
}

export function HeroSection({ onComplete }: HeroSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [contactReplay, setContactReplay] = useState(0);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const iframe = iframeRef.current;
    if (!section || !iframe) return;

    let isActive = true;

    const syncState = () => {
      iframe.contentWindow?.postMessage(
        {
          type: "maiacoelho-hero:active",
          active: isActive,
          hasContinuation: Boolean(
            onComplete || document.getElementById("landing-content")
          ),
        },
        window.location.origin
      );
    };

    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframe.contentWindow
      ) {
        return;
      }

      if (event.data?.type === "maiacoelho-hero:loaded") {
        syncState();
      } else if (event.data?.type === "maiacoelho-hero:ready") {
        setIsHeroReady(true);
      } else if (event.data?.type === "maiacoelho-hero:section") {
        const nextSection = Number(event.data.section) || 1;
        setActiveSection(nextSection);
      } else if (event.data?.type === "maiacoelho-hero:error") {
        setHasError(true);
      } else if (event.data?.type === "maiacoelho-hero:continue") {
        if (onComplete) {
          onComplete();
          return;
        }
        const target = document.getElementById("landing-content");
        if (target) {
          iframe.blur();
          target.tabIndex = -1;
          target.focus({ preventScroll: true });
          target.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
            block: "start",
          });
        }
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      isActive = entry.isIntersecting;
      syncState();
    });

    observer.observe(section);
    window.addEventListener("message", handleMessage);

    return () => {
      observer.disconnect();
      window.removeEventListener("message", handleMessage);
    };
  }, [onComplete]);

  useEffect(() => {
    if (activeSection !== 4) {
      setContactVisible(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setContactReplay((n) => n + 1);
      setContactVisible(true);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [activeSection]);

  const forwardWheelToIframe = (e: React.WheelEvent<HTMLDivElement>) => {
    const win = iframeRef.current?.contentWindow;
    const doc = iframeRef.current?.contentDocument;
    if (!win) return;
    const target = doc?.documentElement ?? win;
    target.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        deltaMode: e.deltaMode,
        bubbles: true,
        cancelable: true,
      })
    );
  };

  return (
    <section
      ref={sectionRef}
      id="maiacoelho-hero"
      aria-label="MaiaCoelho — Design & Motion Studio"
      className="relative h-svh min-h-[440px] w-full overflow-hidden bg-[#141414]"
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-0 bg-[#141414] transition-opacity duration-500 ${
          isHeroReady && activeSection === 1
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      >
        <Antigravity
          colors={HERO_ANTIGRAVITY_COLORS}
          count={1500}
          magnetRadius={9}
          ringRadius={7}
          particleSize={0.9}
          autoAnimate={true}
        />
      </div>
      <iframe
        ref={iframeRef}
        src="/maiacoelho-hero/index.html"
        title="MaiaCoelho — Web, social and motion design for brands that live online"
        className="absolute inset-0 z-10 h-full w-full border-0 bg-transparent"
        style={{ background: "transparent", colorScheme: "dark" }}
        allow="autoplay"
        onError={() => setHasError(true)}
      />
      <div
        aria-hidden={!contactVisible}
        onWheel={contactVisible ? forwardWheelToIframe : undefined}
        className={`absolute z-20 flex items-center justify-center max-sm:left-1/2 max-sm:top-[64px] max-sm:h-[30%] max-sm:w-[78%] max-sm:-translate-x-1/2 sm:bottom-[60px] sm:right-[4%] sm:top-[74px] sm:w-[46%] ${
          contactVisible
            ? "pointer-events-auto opacity-100 translate-y-0 scale-100"
            : "pointer-events-none opacity-0 translate-y-5 scale-[0.97]"
        }`}
        style={{
          transition: contactVisible
            ? "opacity 700ms cubic-bezier(0.65, 0, 0.35, 1), transform 800ms cubic-bezier(0.25, 1, 0.5, 1)"
            : "opacity 320ms cubic-bezier(0.65, 0, 0.35, 1), transform 400ms cubic-bezier(0.65, 0, 0.35, 1)",
          WebkitMaskImage:
            "radial-gradient(closest-side, #000 78%, transparent 100%)",
          maskImage:
            "radial-gradient(closest-side, #000 78%, transparent 100%)",
        }}
      >
        <GlassIconReveal
          logo="/assets/buck-contact.png"
          label="Buck — MaiaCoelho"
          look="dark"
          background="#141414"
          plateColor="#22211F"
          originalColors={true}
          iconPlate={true}
          keepPlate={false}
          tileSize={340}
          logoScale={0.78}
          finalScale={1.06}
          loop={true}
          hold={3}
          replayTrigger={contactReplay}
          tuning={CONTACT_GLASS_TUNING}
          className="h-full w-full max-h-[540px] max-w-[540px]"
        />
      </div>
      {hasError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-[#141414] p-6 text-center text-[#F1F0EB]">
          <p className="max-w-md text-lg font-bold tracking-[-0.03em]">
            MaiaCoelho. Made to stop the scroll.
          </p>
          <p className="max-w-md text-sm text-[#A3A39E]">
            Web, social and motion design for brands that live online.
          </p>
          <button
            type="button"
            className="rounded-full bg-[#FF5A1F] px-6 py-3 text-sm font-bold text-[#141414] transition-colors duration-200 hover:bg-[#F1F0EB]"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
          <a
            href="#landing-content"
            className="font-mono text-xs uppercase tracking-[0.08em] text-[#A3A39E] underline underline-offset-4 hover:text-[#F1F0EB]"
          >
            See the work
          </a>
        </div>
      )}
    </section>
  );
}
