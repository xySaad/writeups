import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

process.loadEnvFile();
export const env = createEnv({
  server: {
    TOKEN: z.string(),
    DOMAIN: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
