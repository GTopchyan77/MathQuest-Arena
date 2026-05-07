"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { cx } from "@/lib/utils";

const SYMBOLS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "-", "\u00D7", "\u00F7", "="] as const;
const SYMBOL_COLORS = ["34,211,238", "96,165,250", "167,139,250", "250,204,21"] as const;

type PointerTrailOverlayProps = {
  containerRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  className?: string;
};

type TrailPoint = {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  radius: number;
};

type SymbolParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  rotation: number;
  spin: number;
  life: number;
  maxLife: number;
  size: number;
  symbol: (typeof SYMBOLS)[number];
  color: (typeof SYMBOL_COLORS)[number];
};

export function PointerTrailOverlay({ containerRef, enabled = true, className }: PointerTrailOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!enabled || reducedMotion || !canvas || !container) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const coarsePointer = typeof window !== "undefined" && (window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0);
    const maxTrailPoints = coarsePointer ? 12 : 20;
    const maxSymbols = coarsePointer ? 16 : 28;
    const spawnIntervalMs = coarsePointer ? 80 : 42;
    const movementThreshold = coarsePointer ? 16 : 10;

    const trailPoints: TrailPoint[] = [];
    const symbolParticles: SymbolParticle[] = [];
    const pointer = { x: 0, y: 0, active: false };

    let rect = container.getBoundingClientRect();
    let rafId = 0;
    let lastFrameTime = performance.now();
    let lastSpawnTime = 0;
    let lastTrailX = Number.NaN;
    let lastTrailY = Number.NaN;

    const resizeCanvas = () => {
      rect = container.getBoundingClientRect();

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const addTrailPoint = (x: number, y: number) => {
      trailPoints.push({
        x,
        y,
        life: coarsePointer ? 0.42 : 0.52,
        maxLife: coarsePointer ? 0.42 : 0.52,
        radius: coarsePointer ? 26 : 32
      });

      if (trailPoints.length > maxTrailPoints) {
        trailPoints.splice(0, trailPoints.length - maxTrailPoints);
      }
    };

    const addSymbolParticle = (x: number, y: number) => {
      symbolParticles.push({
        x: x + (Math.random() - 0.5) * (coarsePointer ? 20 : 28),
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * (coarsePointer ? 22 : 30),
        vy: -(coarsePointer ? 34 : 46) - Math.random() * 16,
        gravity: coarsePointer ? 84 : 112,
        rotation: (Math.random() - 0.5) * 0.4,
        spin: (Math.random() - 0.5) * 0.75,
        life: coarsePointer ? 0.95 : 1.15,
        maxLife: coarsePointer ? 0.95 : 1.15,
        size: coarsePointer ? 14 + Math.random() * 6 : 15 + Math.random() * 8,
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        color: SYMBOL_COLORS[Math.floor(Math.random() * SYMBOL_COLORS.length)]
      });

      if (symbolParticles.length > maxSymbols) {
        symbolParticles.splice(0, symbolParticles.length - maxSymbols);
      }
    };

    const maybeSpawn = (x: number, y: number) => {
      const now = performance.now();
      const distance = Number.isNaN(lastTrailX) ? movementThreshold : Math.hypot(x - lastTrailX, y - lastTrailY);

      if (distance < movementThreshold && now - lastSpawnTime < spawnIntervalMs) {
        return;
      }

      lastTrailX = x;
      lastTrailY = y;
      lastSpawnTime = now;

      addTrailPoint(x, y);

      const extraSymbols = coarsePointer ? 1 : Math.random() > 0.55 ? 2 : 1;
      for (let index = 0; index < extraSymbols && symbolParticles.length < maxSymbols; index += 1) {
        addSymbolParticle(x, y);
      }
    };

    const updatePointer = (clientX: number, clientY: number, forceSpawn = false) => {
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;

      if (pointer.x < 0 || pointer.x > rect.width || pointer.y < 0 || pointer.y > rect.height) {
        return;
      }

      if (forceSpawn) {
        maybeSpawn(pointer.x, pointer.y);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      pointer.active = true;
      updatePointer(event.clientX, event.clientY, true);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && !pointer.active) {
        return;
      }

      updatePointer(event.clientX, event.clientY, true);
    };

    const handlePointerUp = () => {
      pointer.active = false;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      lastTrailX = Number.NaN;
      lastTrailY = Number.NaN;
    };

    const renderFrame = (time: number) => {
      const delta = Math.min((time - lastFrameTime) / 1000, 0.034);
      lastFrameTime = time;

      context.clearRect(0, 0, rect.width, rect.height);

      for (let index = trailPoints.length - 1; index >= 0; index -= 1) {
        const point = trailPoints[index];
        point.life -= delta;

        if (point.life <= 0) {
          trailPoints.splice(index, 1);
          continue;
        }

        const progress = point.life / point.maxLife;
        const gradient = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius * (0.7 + (1 - progress) * 0.35));
        gradient.addColorStop(0, `rgba(103, 232, 249, ${0.14 * progress})`);
        gradient.addColorStop(0.45, `rgba(96, 165, 250, ${0.09 * progress})`);
        gradient.addColorStop(1, "rgba(15, 23, 42, 0)");

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fill();
      }

      for (let index = symbolParticles.length - 1; index >= 0; index -= 1) {
        const particle = symbolParticles[index];
        particle.life -= delta;

        if (particle.life <= 0) {
          symbolParticles.splice(index, 1);
          continue;
        }

        particle.vy += particle.gravity * delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.rotation += particle.spin * delta;

        const progress = particle.life / particle.maxLife;
        const alpha = Math.min(0.5, progress * 0.5);

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.font = `700 ${particle.size}px Inter, system-ui, sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.shadowBlur = 18;
        context.shadowColor = `rgba(${particle.color}, ${alpha * 0.9})`;
        context.fillStyle = `rgba(${particle.color}, ${alpha})`;
        context.fillText(particle.symbol, 0, 0);
        context.restore();
      }

      rafId = window.requestAnimationFrame(renderFrame);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    container.addEventListener("pointerdown", handlePointerDown, { passive: true });
    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerup", handlePointerUp, { passive: true });
    container.addEventListener("pointercancel", handlePointerUp, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
      container.removeEventListener("pointerleave", handlePointerLeave);
      context.clearRect(0, 0, rect.width, rect.height);
    };
  }, [containerRef, enabled, reducedMotion]);

  if (!enabled || reducedMotion) {
    return null;
  }

  return <canvas aria-hidden="true" className={cx("pointer-events-none absolute inset-0 z-[1] h-full w-full", className)} ref={canvasRef} />;
}
