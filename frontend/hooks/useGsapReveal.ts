"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

type GsapRevealOptions = {
    container?: {
        opacity?: number;
        fromScale?: number;
        fromX?: number;
        fromY?: number;
        duration?: number;
        ease?: string;
    };
    items?: {
        opacity?: number;
        fromScale?: number;
        fromX?: number;
        fromY?: number;
        duration?: number;
        stagger?: number;
        ease?: string;
        delay?: number;
    };
};

export default function useGsapReveal<
    TContainer extends HTMLElement = HTMLDivElement,
    TItem extends HTMLElement = HTMLElement
>(options?: GsapRevealOptions, deps: any[] = []) {
    const containerRef = useRef<TContainer | null>(null);
    const itemsRef = useRef<TItem[]>([]);

    const setItemRef = (el: TItem | null) => {
        if (el && !itemsRef.current.includes(el)) {
            itemsRef.current.push(el);
        }
    };

    useGSAP(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            /* ---------------- CONTAINER ---------------- */

            const containerFrom: gsap.TweenVars = {
                opacity: options?.container?.opacity ?? 0,
                transformOrigin: "50% 50%",
            };

            if (options?.container?.fromScale !== undefined)
                containerFrom.scale = options.container.fromScale;

            if (options?.container?.fromX !== undefined)
                containerFrom.x = options.container.fromX;

            if (options?.container?.fromY !== undefined)
                containerFrom.y = options.container.fromY;

            gsap.fromTo(
                containerRef.current!,
                containerFrom,
                {
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                    duration: options?.container?.duration ?? 0.6,
                    ease: options?.container?.ease ?? "power3.out",
                    force3D: true,
                    clearProps: "transform",
                }
            );

            /* ---------------- ITEMS ---------------- */

            if (itemsRef.current.length) {
                const itemsFrom: gsap.TweenVars = {
                    opacity: options?.items?.opacity ?? 0,
                    transformOrigin: "50% 50%",
                };

                if (options?.items?.fromScale !== undefined)
                    itemsFrom.scale = options.items.fromScale;

                if (options?.items?.fromX !== undefined)
                    itemsFrom.x = options.items.fromX;

                if (options?.items?.fromY !== undefined)
                    itemsFrom.y = options.items.fromY;

                gsap.fromTo(
                    itemsRef.current,
                    itemsFrom,
                    {
                        opacity: 1,
                        scale: 1,
                        x: 0,
                        y: 0,
                        duration: options?.items?.duration ?? 0.4,
                        stagger: options?.items?.stagger ?? 0.08,
                        ease: options?.items?.ease ?? "power3.out",
                        delay: options?.items?.delay ?? 0,
                        force3D: true,
                        clearProps: "transform",
                    }
                );
            }
        }, containerRef);

        return () => ctx.revert();
    }, deps);

    return {
        containerRef,
        itemRef: setItemRef,
    };
}
