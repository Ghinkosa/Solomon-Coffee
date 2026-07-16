"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import missionPrimary from "@/images/farm/farm-drone-shot.webp";
import missionSecondary from "@/images/farm/workers-on-farm.webp";

interface MissionVisual3DProps {
  alt: string;
  quote: string;
}

type TransformState = {
  rotateX: number;
  rotateY: number;
  secondaryOpacity: number;
};

const IDLE_TRANSFORM: TransformState = {
  rotateX: 0,
  rotateY: 0,
  secondaryOpacity: 0,
};

const MAX_TILT_DEGREES = 12;

export default function MissionVisual3D({ alt, quote }: MissionVisual3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const prefersReducedMotionRef = useRef(false);
  const isCoarsePointerRef = useRef(false);

  const [isVisible, setIsVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transform, setTransform] = useState<TransformState>(IDLE_TRANSFORM);

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    isCoarsePointerRef.current = window.matchMedia("(pointer: coarse)").matches;

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (!entry.isIntersecting) {
          setIsActive(false);
          setTransform(IDLE_TRANSFORM);
        }
      },
      { rootMargin: "120px", threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const resetTransform = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    setIsActive(false);
    setTransform(IDLE_TRANSFORM);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (
        !isVisible ||
        prefersReducedMotionRef.current ||
        isCoarsePointerRef.current
      ) {
        return;
      }

      const element = containerRef.current;
      if (!element) return;

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      const { clientX, clientY } = event;
      rafRef.current = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const offsetX = (clientX - rect.left) / rect.width - 0.5;
        const offsetY = (clientY - rect.top) / rect.height - 0.5;

        setTransform({
          rotateY: offsetX * MAX_TILT_DEGREES,
          rotateX: -offsetY * MAX_TILT_DEGREES,
          secondaryOpacity: Math.min(
            1,
            Math.abs(offsetX) * 1.4 + Math.abs(offsetY) * 0.4,
          ),
        });
      });
    },
    [isVisible],
  );

  const handlePointerEnter = useCallback(() => {
    if (!prefersReducedMotionRef.current && !isCoarsePointerRef.current) {
      setIsActive(true);
    }
  }, []);

  const cardTransform =
    isActive && isVisible
      ? `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale3d(1.02, 1.02, 1.02)`
      : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTransform}
      onPointerEnter={handlePointerEnter}
    >
      <div
        className="relative h-full w-full will-change-transform"
        style={{
          transform: cardTransform,
          transition: isActive
            ? "transform 0.12s ease-out"
            : "transform 0.45s ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        <Image
          src={missionPrimary}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
        <Image
          src={missionSecondary}
          alt=""
          aria-hidden
          fill
          className="pointer-events-none object-cover transition-opacity duration-150 ease-out"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
          style={{ opacity: transform.secondaryOpacity }}
        />
      </div>

      <div className="pointer-events-none absolute bottom-8 left-8 right-8 z-10 rounded-xl bg-white/95 p-6 shadow-lg backdrop-blur">
        <p className="text-center font-serif text-xl italic text-amber-800">
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </div>
  );
}
