import { ApplicationCommandOptionType, PermissionFlagsBits, type TextChannel } from "discord.js";
import type { Command } from "@/commands/index.js";

export const command: Command = {
    name: "clear",
    description: "Clear messages in the channel",
    options: [
        {
            name: "amount",
            description: "Amount of messages to delete",
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],
    defaultMemberPermissions: [PermissionFlagsBits.ManageMessages],
    callback(_, interaction) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We know that the option is present, because it is required
        const amount = interaction.options.getInteger("amount", true) + 1;
        for (let i = 0; i < amount / 100; i++) {
            void (interaction.channel as TextChannel).bulkDelete(amount > 100 ? 100 : amount);
        }
    },
};
