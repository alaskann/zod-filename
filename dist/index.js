"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var index_exports = {};
__export(index_exports, {
  zfn: () => zfn
});
module.exports = __toCommonJS(index_exports);
var import_zod = require("zod");

// regex.ts
var windowsReserved = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/i;
var windowsChars = /[<>:"/\\|?*\x00-\x1F]/;
var trailingChars = /[. ]$/;
var linuxChars = /[\0/]/;
var macChars = /[:/]/;
var registry = {
  // --- Universal / Common ---
  universal: {
    schema: new RegExp(
      `^(?!${windowsReserved.source})[^${windowsChars.source.slice(
        1,
        -1
      )}${linuxChars.source.slice(1, -1)}]+$`
    ),
    message: "Invalid universal filename: contains illegal characters or is a reserved name."
  },
  // --- macOS ---
  macos: {
    schema: new RegExp(`^[^${macChars.source.slice(1, -1)}]+$`),
    message: "Invalid macOS filename: cannot contain '/' or ':' characters."
  },
  // --- Linux ---
  linux: {
    // Added generic Linux entry
    schema: new RegExp(`^[^${linuxChars.source.slice(1, -1)}]+$`),
    message: "Invalid Linux filename: cannot contain null or '/' characters."
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
    message: `Invalid Windows filename: contains illegal characters (< > : " / \\ | ? *), is a reserved name, or ends with '.' or ' '.`
  }
};
function isValidWindowsLike(filename) {
  if (windowsReserved.test(filename)) return false;
  if (windowsChars.test(filename)) return false;
  if (trailingChars.test(filename)) return false;
  return filename.length > 0;
}
["windows", "ntfs", "fat32", "exfat", "refs", "fat16", "fat12"].forEach(
  (sys) => {
    const key = sys;
    if (registry[key]) {
      registry[key].schema = {
        test: isValidWindowsLike
      };
    }
  }
);

// index.ts
var baseSchema = import_zod.z.string();
function matcher(args) {
  if (!args) {
    return baseSchema;
  }
  const { system } = args;
  const provided = registry[system];
  if (!provided) {
    throw new Error(`Unsupported system type: ${String(system)}`);
  }
  return baseSchema.regex(provided.schema, { message: provided.message });
}
var zfn = {
  filename: matcher
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  zfn
});
//# sourceMappingURL=index.js.map