/**
 * Konditor — Unified Tailwind CSS configuration
 * Single source of truth for design tokens.
 * Load this file AFTER the Tailwind CDN script.
 */

/** Base URL do backend. */
window.KONDITOR_API = 'http://localhost:8080';

/** Google OAuth2 Client ID. */
window.KONDITOR_GOOGLE_CLIENT_ID = '1045651153478-4379bpb4fepqg0gvlg4goktic09vl883.apps.googleusercontent.com';

tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface":                       "#f9f9fb",
        "background":                    "#f9f9fb",
        "surface-bright":                "#f9f9fb",
        "surface-dim":                   "#d6dadf",
        "surface-variant":               "#e0e3e7",
        "surface-container-lowest":      "#ffffff",
        "surface-container-low":         "#f3f3f6",
        "surface-container":             "#eceef1",
        "surface-container-high":        "#e6e8ec",
        "surface-container-highest":     "#e0e3e7",
        "surface-tint":                  "#bd0050",
        "on-surface":                    "#2f3336",
        "on-surface-variant":            "#5c5f63",
        "on-background":                 "#2f3336",
        "outline":                       "#777b7f",
        "outline-variant":               "#afb2b6",
        "primary":                       "#bd0050",
        "primary-dim":                   "#a70046",
        "primary-fixed":                 "#ffa9b9",
        "primary-fixed-dim":             "#ff93aa",
        "primary-container":             "#ffa9b9",
        "on-primary":                    "#fff7f7",
        "on-primary-fixed":              "#560020",
        "on-primary-fixed-variant":      "#8d003a",
        "on-primary-container":          "#7d0032",
        "inverse-primary":               "#ff4d81",
        "secondary":                     "#006f1d",
        "secondary-dim":                 "#006118",
        "secondary-fixed":               "#94f990",
        "secondary-fixed-dim":           "#86eb83",
        "secondary-container":           "#94f990",
        "on-secondary":                  "#eaffe2",
        "on-secondary-fixed":            "#004a10",
        "on-secondary-fixed-variant":    "#006b1b",
        "on-secondary-container":        "#006017",
        "tertiary":                      "#9f403a",
        "tertiary-dim":                  "#90352f",
        "tertiary-fixed":                "#ff9f96",
        "tertiary-fixed-dim":            "#fe8a80",
        "tertiary-container":            "#ff9f96",
        "on-tertiary":                   "#fff7f6",
        "on-tertiary-fixed":             "#4a0104",
        "on-tertiary-fixed-variant":     "#76211e",
        "on-tertiary-container":         "#691916",
        "error":                         "#ac3434",
        "error-dim":                     "#70030f",
        "error-container":               "#f56965",
        "on-error":                      "#fff7f6",
        "on-error-container":            "#65000b",
        "inverse-surface":               "#0c0e10",
        "inverse-on-surface":            "#9c9d9f",
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body":     ["Manrope", "sans-serif"],
        "label":    ["Manrope", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg":      "0.5rem",
        "xl":      "0.75rem",
        "full":    "9999px",
      },
    },
  },
};
