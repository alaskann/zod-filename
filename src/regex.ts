import { RegExpConfig, System } from "./types";

// Common Regex Parts
const windowsReserved = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/i;
const windowsChars = /[<>:"/\\|?*\x00-\x1F]/;
const trailingChars = /[. ]$/;
const linuxChars = /[\0/]/;
const macChars = /[:/]/;
const isoChars = /^[A-Z0-9_.-]+$/i; // Simplified ISO 9660 (Level 1/Joliet)

export const registry: Partial<Record<System, RegExpConfig>> = {
  // --- Universal / Common ---
  universal: {
    schema: new RegExp(
      `^(?!${windowsReserved.source})[^${windowsChars.source.slice(
        1,
        -1
      )}${linuxChars.source.slice(1, -1)}]+$`
    ),
    message:
      "Invalid universal filename: contains illegal characters or is a reserved name.",
  },

  // --- macOS ---
  macos: {
    schema: new RegExp(`^[^${macChars.source.slice(1, -1)}]+$`),
    message: "Invalid macOS filename: cannot contain '/' or ':' characters.",
  },

  // --- Linux ---
  linux: {
    // Added generic Linux entry
    schema: new RegExp(`^[^${linuxChars.source.slice(1, -1)}]+$`),
    message: "Invalid Linux filename: cannot contain null or '/' characters.",
  },

  // --- Windows ---
  windows: {
    schema: new RegExp(
      `^(?!${windowsReserved.source})([^${windowsChars.source.slice(
        1,
        -1
      )}]*[^${windowsChars.source.slice(1, -1)}${trailingChars.source.slice(
        1,
        -1
      )}])$`
    ),
    message:
      "Invalid Windows filename: contains illegal characters (< > : \" / \\ | ? *), is a reserved name, or ends with '.' or ' '.",
  },
};
