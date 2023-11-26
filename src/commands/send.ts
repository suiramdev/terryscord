import { ApplicationCommandOptionType, PermissionFlagsBits, type TextChannel } from "discord.js";
import type { Command } from "@/commands/index.js";

export const command: Command = {
    name: "send",
    description: "Send a message through the bot",
    options: [
        {
            name: "data",
            description: "Message's data in JSON format",
            type: ApplicationCommandOptionType.String,
        },
    ],
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    callback(_, interaction) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We know that the option is present, because it is required
        void (interaction.channel as TextChannel).send(
            JSON.parse(interaction.options.getString("data", true)) as string,
        );
    },
};
