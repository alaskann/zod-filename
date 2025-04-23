import { RegExpConfig, System } from "./types";

// Common Regex Parts
const windowsReserved = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/i;
// eslint-disable-next-line no-control-regex
const windowsChars = /[<>:"/\\|?*\x00-\x1F]/;
const linuxChars = /[\0/]/;
const macChars = /[:/]/;

export const registry: Partial<Record<System, RegExpConfig>> = {
  // --- Universal / Common ---
  universal: {
    schema: new RegExp(
      `^(?!${windowsReserved.source})[^${windowsChars.source.slice(
        1,
        -1
      )}${linuxChars.source.slice(1, -1)}${macChars.source.slice(
        1,
        -1
      )}]+(?<![. ])$`
    ),
    message:
      "Invalid universal filename: contains illegal characters, is a reserved name, or ends with '.' or ' '.",
  },

  // --- macOS ---
  macos: {
    schema: new RegExp(`^[^${macChars.source.slice(1, -1)}]+$`),
    message: "Invalid macOS filename: cannot contain '/' or ':' characters.",
  },

  // --- Linux ---
  linux: {
    schema: new RegExp(`^[^${linuxChars.source.slice(1, -1)}]+$`),
    message: "Invalid Linux filename: cannot contain null or '/' characters.",
  },

  // --- Windows ---
  windows: {
    schema: new RegExp(
      `^(?!${windowsReserved.source})[^${windowsChars.source.slice(
        1,
        -1
      )}]+(?<![. ])$`
    ),
    message:
      "Invalid Windows filename: contains illegal characters (< > : \" / \\ | ? *), is a reserved name, or ends with '.' or ' '.",
  },
};
