import { describe, it, expect } from "vitest";
import { zfn } from "../index";
import { registry } from "../../src/regex";

type TestResult = {
  total: number;
  correct: number;
  incorrect: number;
  falsePositives: number;
  falseNegatives: number;
  accuracy: string;
  fpRate: string;
  fnRate: string;
  falsePositiveCases: string[];
  falseNegativeCases: string[];
};

const testData: Partial<
  Record<keyof typeof registry, { valid: string[]; invalid: string[] }>
> = {
  universal: {
    valid: [
      "file.txt",
      "my_document.docx",
      "notes_2024-07-01.md",
      "image_001.png",
      "README",
      "data123",
      "file.name.with.dots",
      "file-name_with-mixed.chars",
    ],
    invalid: [
      "CON", // Windows reserved
      "file?.txt", // Windows illegal char
      "file/name", // Linux/macOS illegal char
      "file:name", // macOS illegal char
      "file\0name", // Null byte
      "file<name>", // Windows illegal char
      "file|name", // Windows illegal char
      "file.txt ", // Windows trailing space
      "file.txt.", // Windows trailing dot
      "AUX", // Windows reserved
      "NUL", // Windows reserved
      "LPT1", // Windows reserved
      "PRN", // Windows reserved
      "file/with/slash",
    ],
  },
  macos: {
    valid: [
      "file.txt",
      "my_document.docx",
      "notes_2024-07-01.md",
      "README",
      "file-name_with-mixed.chars",
    ],
    invalid: [
      "file/name", // Contains slash
      "file:name", // Contains colon
      "my:file", // Contains colon
      "folder/file", // Contains slash
      ":", // Just a colon
      "/", // Just a slash
      "file/:name", // Both
      "file/name:bad",
    ],
  },
  linux: {
    valid: [
      "file.txt",
      "my_document.docx",
      "notes_2024-07-01.md",
      "README",
      "file-name_with-mixed.chars",
    ],
    invalid: [
      "file/name", // Contains slash
      "file\0name", // Contains null byte
      "/etc/passwd", // Starts with slash
      "folder/file", // Contains slash
      "\0", // Just null byte
      "file/\0name", // Both
    ],
  },
  windows: {
    valid: [
      "file.txt",
      "my_document.docx",
      "notes_2024-07-01.md",
      "README",
      "file-name_with-mixed.chars",
      "data123",
      "file_name",
    ],
    invalid: [
      "CON", // Reserved
      "PRN", // Reserved
      "AUX", // Reserved
      "NUL", // Reserved
      "COM1", // Reserved
      "LPT1", // Reserved
      "file?.txt", // Illegal char
      "file<name>", // Illegal char
      "file|name", // Illegal char
      "file.txt ", // Trailing space
      "file.txt.", // Trailing dot
      "file/name", // Slash
      "file:name", // Colon
      "file*name", // Asterisk
      'file"name', // Double quote
      "file\\name", // Backslash
      "file>name", // Greater than
      "file<name", // Less than
      "file.txt\t", // Control char (tab)
      "file\nname", // Control char (newline)
    ],
  },
};

function runValidationTest(
  system: keyof typeof registry,
  validFilenames: string[],
  invalidFilenames: string[]
): TestResult {
  const schema = zfn.filename({ system });
  let correct = 0;
  let falsePositives = 0; // Invalid classified as valid
  let falseNegatives = 0; // Valid classified as invalid
  const falsePositiveCases: string[] = [];
  const falseNegativeCases: string[] = [];

  // Test valid filenames
  validFilenames.forEach((filename) => {
    const result = schema.safeParse(filename);
    if (result.success) {
      correct++;
    } else {
      falseNegatives++;
      falseNegativeCases.push(filename);
      console.warn(
        `[${String(
          system
        )}] False Negative: '${filename}' should be valid but failed: ${
          result.error.errors[0]?.message
        }`
      );
    }
  });

  // Test invalid filenames
  invalidFilenames.forEach((filename) => {
    const result = schema.safeParse(filename);
    if (!result.success) {
      correct++;
    } else {
      falsePositives++;
      falsePositiveCases.push(filename);
      console.warn(
        `[${String(
          system
        )}] False Positive: '${filename}' should be invalid but passed.`
      );
    }
  });

  const total = validFilenames.length + invalidFilenames.length;
  const incorrect = falsePositives + falseNegatives;
  const accuracy = ((correct / total) * 100).toFixed(2) + "%";
  const fpRate =
    ((falsePositives / invalidFilenames.length) * 100).toFixed(2) + "%";
  const fnRate =
    ((falseNegatives / validFilenames.length) * 100).toFixed(2) + "%";

  return {
    total,
    correct,
    incorrect,
    falsePositives,
    falseNegatives,
    accuracy,
    fpRate,
    fnRate,
    falsePositiveCases,
    falseNegativeCases,
  };
}

// --- Tests ---
describe("zfn.filename validation", () => {
  Object.keys(testData).forEach((system) => {
    const sys = system as keyof typeof registry;
    const { valid, invalid } = testData[sys] ?? { valid: [], invalid: [] };

    it(`should correctly validate filenames for ${system}`, () => {
      const results = runValidationTest(sys, valid, invalid);

      console.log(`
--- ${system.toUpperCase()} Results ---`);
      console.log(`Total Tested: ${results.total}`);
      console.log(`Correct: ${results.correct} (${results.accuracy})`);
      console.log(`Incorrect: ${results.incorrect}`);
      console.log(
        `  False Positives: ${results.falsePositives} (${results.fpRate} of invalid)`
      );
      if (results.falsePositiveCases.length > 0) {
        console.log(`    False Positive Cases:`, results.falsePositiveCases);
      }
      console.log(
        `  False Negatives: ${results.falseNegatives} (${results.fnRate} of valid)`
      );
      if (results.falseNegativeCases.length > 0) {
        console.log(`    False Negative Cases:`, results.falseNegativeCases);
      }

      // Assertions for the test runner
      expect(
        results.falsePositives,
        `False positives found for ${system}`
      ).toBe(0);
      expect(
        results.falseNegatives,
        `False negatives found for ${system}`
      ).toBe(0);
    });
  });

  it("should return base schema if no system is provided", () => {
    const schema = zfn.filename();
    expect(schema.safeParse("validfile").success).toBe(true);
    expect(schema.safeParse("").success).toBe(true); // Base string schema allows empty
    // Add more tests for the base schema if needed
  });

  it("should throw error for unsupported system", () => {
    expect(() => zfn.filename({ system: "unsupportedOS" as any })).toThrow(
      "Unsupported system type: unsupportedOS"
    );
  });
});
