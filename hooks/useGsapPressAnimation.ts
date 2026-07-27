import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function useGsapPressAnimation<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T | null>(null)

    useEffect(() => {
        return () => {
            if (ref.current) gsap.killTweensOf(ref.current)
        }
    }, [])

    const onMouseEnter = () => {
        if (!ref.current) return
        gsap.to(ref.current, { x: 1, scale: 1.01, duration: 0.15, ease: "power2.out" })
    }
    const onMouseLeave = () => {
        if (!ref.current) return
        gsap.to(ref.current, { x: 0, scale: 1, duration: 0.15, ease: "power2.out" })
    }
    const onMouseDown = () => {
        if (!ref.current) return
        gsap.to(ref.current, { scale: 0.99, duration: 0.05 })
    }
    const onMouseUp = () => {
        if (!ref.current) return
        gsap.to(ref.current, { scale: 1, duration: 0.12, ease: "power2.out" })
    }

    return { ref, onMouseEnter, onMouseLeave, onMouseDown, onMouseUp }
}