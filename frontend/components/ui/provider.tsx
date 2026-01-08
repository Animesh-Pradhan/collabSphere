"use client"

import { ChakraProvider, createSystem, defaultConfig, defineAnimationStyles, defineConfig } from "@chakra-ui/react"
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode"

const animationStyles = defineAnimationStyles({
  slideFadeIn: {
    value: {
      animationName: "slide-from-bottom-full, fade-in",
      animationDuration: "0.3s",
    },
  },
  slideFadeOut: {
    value: {
      animationName: "slide-to-bottom-full, fade-out",
      animationDuration: "0.2s",
    },
  },
});

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#eef2ff" },
          100: { value: "#e0e7ff" },
          200: { value: "#c7d2fe" },
          300: { value: "#a5b4fc" },
          400: { value: "#818cf8" },
          500: { value: "#6366f1" },
          600: { value: "#4f46e5" },
          700: { value: "#4338ca" },
          800: { value: "#3730a3" },
          900: { value: "#312e81" },
        },

        gray: {
          50: { value: "#fafafa" },
          100: { value: "#f4f4f5" },
          200: { value: "#e4e4e7" },
          300: { value: "#d4d4d8" },
          400: { value: "#a1a1aa" },
          500: { value: "#71717a" },
          600: { value: "#52525b" },
          700: { value: "#3f3f46" },
          800: { value: "#27272a" },
          900: { value: "#18181b" },
          950: { value: "#09090b" },
        },

        success: {
          500: { value: "#16a34a" },
        },
        warning: {
          500: { value: "#f59e0b" },
        },
        danger: {
          500: { value: "#dc2626" },
        },
        info: {
          500: { value: "#0ea5e9" },
        },
      },

      fonts: {
        body: { value: "Inter, system-ui, sans-serif" },
        heading: { value: "Inter, system-ui, sans-serif" },
      },

      fontSizes: {
        "xs": { value: "0.75rem" },
        "sm": { value: "0.875rem" },
        "md": { value: "1rem" },
        "lg": { value: "1.125rem" },
        "xl": { value: "1.25rem" },
        "2xl": { value: "1.5rem" },
        "3xl": { value: "1.875rem" },
        "4xl": { value: "2.25rem" },
      },
    },

    semanticTokens: {
      colors: {
        bg: {
          primary: { value: { base: "#fff", _dark: "#000" } },
          secondary: { value: { base: "#fff", _dark: "#34094e" } },
          tertiary: { value: { base: "#fefbeaff", _dark: "#0e0e0e" } },
          DEFAULT: { value: "{colors.gray.100}" },
        },
        text: {
          primary: { value: { base: "#000", _dark: "#fff" } },
          secondary: { value: { base: "#e9e4e4", _dark: "#2c2c2c" } },
        },
        button: {
          primary: { value: { base: "#000", _dark: "#34094e" } },
        }
      }
    },

    textStyles: {
      body: { fontSize: "md", color: "text" },
      muted: { fontSize: "sm", color: "muted" },
      caption: { fontSize: "xs", color: "muted" },
      h1: { fontSize: "3xl", fontWeight: "bold", lineHeight: "1.2" },
      h2: { fontSize: "2xl", fontWeight: "semibold" },
      h3: { fontSize: "xl", fontWeight: "semibold" },
      h4: { fontSize: "lg", fontWeight: "medium" },
    },

    animationStyles,
  },
});


const system = createSystem(defaultConfig, config);


export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
