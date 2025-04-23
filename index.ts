import { z } from "zod";

const filenameSchema = z.string();

export const zfn = {
  filename: filenameSchema,
};
