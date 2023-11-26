import { ApplicationCommandData, ChatInputCommandInteraction } from "discord.js";
import type { Client } from "@/client.js";

export type Command = ApplicationCommandData & {
    callback: (client: Client, interaction: ChatInputCommandInteraction) => any;
};
