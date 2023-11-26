import { ApplicationCommandOptionType } from "discord.js";
import type { Command } from "@/commands/index.js";
import { successEmbed } from "@/utils/embeds.js";

export const command: Command = {
    name: "captcha",
    description: "Setup a captcha verification",
    options: [
        {
            name: "setup",
            description: "Setup a captcha verification",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "role",
                    description: "Role to give to the user if the captcha is successful",
                    type: ApplicationCommandOptionType.Role,
                    required: true,
                },
            ],
        },
    ],
    defaultMemberPermissions: ["Administrator"],
    async callback(client, interaction) {
        await client.prisma.captchaSetup.upsert({
            where: {
                guildId: interaction.guildId!,
            },
            create: {
                guildId: interaction.guildId!,
                channelId: interaction.channelId,
                roleId: interaction.options.getRole("role", true).id,
            },
            update: {
                channelId: interaction.channelId,
                roleId: interaction.options.getRole("role", true).id,
            },
        });

        await interaction.followUp({
            embeds: [successEmbed("Captcha verification setup successfully!")],
            ephemeral: true,
        });
    },
};
