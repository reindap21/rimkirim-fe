import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";

const RimkirimPreset = definePreset(Aura, {
  semantic: {
    primary: {
      500: "var(--rimkirim-primary-main)",
    },

    colorScheme: {
      light: {
        primary: {
          color: "var(--rimkirim-primary-main)",
          inverseColor: "#000000",
          hoverColor: "#a1d400",
          activeColor: "#8cb800",
        },

        highlight: {
          background: "var(--rimkirim-background-10)",
          focusBackground: "var(--rimkirim-background-30)",
          color: "var(--rimkirim-neutral-100)",
          focusColor: "var(--rimkirim-neutral-100)",
        },

        focusRing: {
          color: "var(--rimkirim-primary-main)",
          shadow: "0 0 0 1px var(--rimkirim-primary-main)",
          width: "1px",
        },

        formField: {
          backgroundColor: "#ffffff",
          disabledBackgroundColor: "var(--rimkirim-background-30)",
          borderColor: "var(--rimkirim-neutral-30)",
          hoverBorderColor: "var(--rimkirim-primary-main-opacity-70)",
          focusBorderColor: "var(--rimkirim-primary-main)",
          invalidBorderColor: "var(--rimkirim-semantic-danger)",
          color: "var(--rimkirim-neutral-100)",
          placeholderColor: "var(--rimkirim-neutral-60)",
          shadow: "none",

          fontSize: "14px", // ✅ TARUH DI SINI
        },
      },
    },
  },
});

export default RimkirimPreset;
