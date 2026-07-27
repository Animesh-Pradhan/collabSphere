"use client"

import { Spinner } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MdStar, MdOutlineStarBorder } from "react-icons/md";

interface FavoriteStarProps {
    isFavorite: boolean;
    loading?: boolean;
    onToggle: () => void;
}

export default function FavoriteStar({ isFavorite, loading, onToggle }: FavoriteStarProps) {
    const starWrapperRef = useRef<HTMLSpanElement | null>(null);
    const prevFavoriteRef = useRef(isFavorite);

    useEffect(() => {
        if (!loading && isFavorite !== prevFavoriteRef.current) {
            const becameFavorite = isFavorite;
            prevFavoriteRef.current = isFavorite;

            if (becameFavorite && starWrapperRef.current) {
                gsap.killTweensOf(starWrapperRef.current);
                gsap.fromTo(
                    starWrapperRef.current,
                    { scale: 0.3, rotate: -15, opacity: 0 },
                    {
                        scale: 1,
                        rotate: 0,
                        opacity: 1,
                        duration: 0.55,
                        ease: "elastic.out(1, 0.5)",
                        transformOrigin: "50% 50%",
                        force3D: true,
                        clearProps: "transform",
                    }
                );
            }
        }
    }, [isFavorite, loading]);

    useEffect(() => {
        return () => {
            if (starWrapperRef.current) gsap.killTweensOf(starWrapperRef.current);
        };
    }, []);

    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={isFavorite ? "Unfavorite" : "Favorite"}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                lineHeight: 0,
            }}
        >
            {loading ? (
                <Spinner size="xs" />
            ) : isFavorite ? (
                <span ref={starWrapperRef} style={{ display: "inline-flex", filter: "drop-shadow(0 0 4px rgba(234,179,8,0.55))" }}>
                    <MdStar size={17} color="#eab308" />
                </span>
            ) : (
                <span style={{ display: "inline-flex", transition: "color 0.2s ease, transform 0.15s ease" }}>
                    <MdOutlineStarBorder size={17} color="var(--chakra-colors-text-secondary)" />
                </span>
            )}
        </button>
    );
}