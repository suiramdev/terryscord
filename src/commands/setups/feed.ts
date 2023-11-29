import { ApplicationCommandOptionType } from "discord.js";
import type { Command } from "@/commands/index.js";
import { errorEmbed, successEmbed } from "@/utils/embeds.js";

export const command: Command = {
    name: "feed",
    description: "Subscribe to RSS feeds",
    options: [
        {
            name: "subscribe",
            description: "Subscribe to a RSS feed",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "url",
                    description: "URL of the RSS feed",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "channel",
                    description: "Channel to send the RSS feed",
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                },
            ],
        },
        {
            name: "unsubscribe",
            description: "Unsubscribe from a RSS feed",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "url",
                    description: "URL of the RSS feed",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "channel",
                    description: "Channel of the RSS feed",
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                },
            ],
        },
    ],
    defaultMemberPermissions: ["Administrator"],
    async callback(client, interaction) {
        const existingSubscription = await client.prisma.feedSubscription.findUnique({
            where: {
                unique_feed_subscription: {
                    guildId: interaction.guildId!,
                    channelId: interaction.options.getChannel("channel", true).id,
                    feedUrl: interaction.options.getString("url", true),
                },
            },
        });

        switch (interaction.options.getSubcommand()) {
            case "subscribe":
                if (existingSubscription) {
                    await interaction.followUp({
                        embeds: [errorEmbed("This channel is already subscribed to the feed.")],
                        ephemeral: true,
                    });

                    return;
                }

                await client.prisma.feedSubscription.create({
                    data: {
                        feedUrl: interaction.options.getString("url", true),
                        guildId: interaction.guildId!,
                        channelId: interaction.options.getChannel("channel", true).id,
                    },
                });

                await interaction.followUp({
                    embeds: [successEmbed("Successfully subscribed the channel to the feed.")],
                    ephemeral: true,
                });
                break;
            case "unsubscribe":
                if (!existingSubscription) {
                    await interaction.followUp({
                        embeds: [errorEmbed("This channel is not subscribed to the feed.")],
                        ephemeral: true,
                    });

                    return;
                }

                await client.prisma.feedSubscription.delete({
                    where: {
                        unique_feed_subscription: {
                            guildId: interaction.guildId!,
                            channelId: interaction.options.getChannel("channel", true).id,
                            feedUrl: interaction.options.getString("url", true),
                        },
                    },
                });

                await interaction.followUp({
                    embeds: [successEmbed("Successfully unsubscribed the channel from the feed.")],
                    ephemeral: true,
                });
                break;
        }
    },
};
