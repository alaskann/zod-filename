import { z } from "zod";
import { registry } from "./regex";

const baseSchema = z.string();

type MatcherArgs = {
  system: keyof typeof registry;
};

function matcher(args?: MatcherArgs) {
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

export const zfn = {
  filename: matcher,
};
