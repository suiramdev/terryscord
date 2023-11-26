import { IntentsBitField } from "discord.js";
import { Client } from "@/client.js";
import env from "@/env.js";

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.DirectMessageReactions,
        IntentsBitField.Flags.MessageContent,
    ],
});
await client.login(env.TOKEN);
await client.loadEvents();
await client.loadCommands();
