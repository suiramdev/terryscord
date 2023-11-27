import { z } from "zod";

const envSchema = z.object({
    TOKEN: z.string(),
});

const env = envSchema.parse(process.env);

export default env;
