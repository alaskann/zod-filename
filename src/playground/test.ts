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

  // Test valid filenames
  validFilenames.forEach((filename) => {
    const result = schema.safeParse(filename);
    if (result.success) {
      correct++;
    } else {
      falseNegatives++;
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
  };
}

// --- Test Data --- (Add more comprehensive examples)
const testData: Partial<
  Record<keyof typeof registry, { valid: string[]; invalid: string[] }>
> = {
  universal: {
    valid: ["file.txt", "document_1", "image-1.jpg", "archive.zip", "a"],
    invalid: [
      "file/name", // Contains /
      "file:name", // Contains :
      "file*name", // Contains *
      "file?name", // Contains ?
      "file<name", // Contains <
      "file>name", // Contains >
      "file|name", // Contains |
      '"file"', // Contains "
      "COM1", // Reserved name
      "file.", // Ends with .
      "file ", // Ends with space
      "", // Empty
      "\0null", // Contains null
    ],
  },
  macos: {
    valid: ["file.txt", "document 1", "image~1.png", "archive.tar.gz", "a"],
    invalid: [
      "file/name", // Contains /
      "file:name", // Contains :
      "", // Empty
    ],
  },
  linux: {
    valid: ["file.txt", "document.1", ".hiddenfile", "a_b-c=d+e", "a"],
    invalid: [
      "file/name", // Contains /
      "\0null", // Contains null
      "", // Empty
    ],
  },
  windows: {
    valid: ["file.txt", "document 1", "image_1.jpeg", "archive.7z", "a"],
    invalid: [
      "file/name", // Contains /
      "file:name", // Contains :
      "file*name", // Contains *
      "file?name", // Contains ?
      "file<name", // Contains <
      "file>name", // Contains >
      "file|name", // Contains |
      '"file"', // Contains "
      "COM1", // Reserved name
      "LPT2.txt", // Reserved name
      "file.", // Ends with .
      "file ", // Ends with space
      "", // Empty
      "nul", // Reserved name
      "con.txt", // Reserved name
    ],
  },
};

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
      console.log(
        `  False Negatives: ${results.falseNegatives} (${results.fnRate} of valid)`
      );

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
