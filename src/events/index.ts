import type { Client } from "@/client.js";

export interface Event {
    name: string;
    callback: (client: Client, ...args: any[]) => void | Promise<void>;
}
