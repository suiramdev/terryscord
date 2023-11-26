import { z } from "zod";
import { config } from "dotenv";

config();

const envSchema = z.object({
    TOKEN: z.string(),
});

const env = envSchema.parse(process.env);

export default env;
