import { ApplicationCommandOptionType, ComponentType, ButtonStyle } from "discord.js";
import type { Command } from "@/commands/index.js";
import { errorEmbed, successEmbed } from "@/utils/embeds.js";

export const command: Command = {
    name: "role-picker",
    description: "Create a role picker",
    options: [
        {
            name: "display",
            description: "Display a role picker in the channel",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "ID of the picker",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "title",
                    description: "Embed title",
                    type: ApplicationCommandOptionType.String,
                },
                {
                    name: "description",
                    description: "Embed description",
                    type: ApplicationCommandOptionType.String,
                },
            ],
        },
        {
            name: "create",
            description: "Create a role picker",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "ID of the picker",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: "add",
            description: "Add a role to an existent picker",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "ID of the picker",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "role",
                    description: "Role to add to the picker",
                    type: ApplicationCommandOptionType.Role,
                    required: true,
                },
            ],
        },
        {
            name: "remove",
            description: "Remove a role from the picker",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "ID of the picker",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "role",
                    description: "Role to remove from the picker",
                    type: ApplicationCommandOptionType.Role,
                    required: true,
                },
            ],
        },
    ],
    defaultMemberPermissions: ["Administrator"],
    async callback(client, interaction) {
        const existingRolePicker = await client.prisma.rolePicker.findUnique({
            where: {
                name: interaction.options.getString("id")!,
                guildId: interaction.guildId!,
            },
            include: {
                Roles: true,
            },
        });
        if (interaction.options.getSubcommand() != "create" && !existingRolePicker) {
            await interaction.followUp({
                embeds: [errorEmbed("Role picker not found")],
                ephemeral: true,
            });

            return;
        }

        switch (interaction.options.getSubcommand()) {
            case "display":
                await interaction.channel!.send({
                    embeds: [
                        {
                            title: interaction.options.getString("title") ?? "Rôles",
                            description:
                                interaction.options.getString("description") ??
                                "Cliquez sur les boutons ci-dessous pour obtenir un rôle.",
                            color: 0x4f545c,
                        },
                    ],
                    components: [
                        {
                            type: ComponentType.ActionRow,
                            components: existingRolePicker!.Roles.map((role) => ({
                                type: ComponentType.Button,
                                customId: `pick-role-${role.id}`,
                                label: interaction.guild!.roles.cache.get(role.id)?.name,
                                style: ButtonStyle.Secondary,
                            })),
                        },
                    ],
                });
                break;
            case "create":
                if (existingRolePicker) {
                    await interaction.followUp({
                        embeds: [errorEmbed("Role picker already exist")],
                        ephemeral: true,
                    });

                    return;
                }

                await client.prisma.rolePicker.create({
                    data: {
                        name: interaction.options.getString("id", true),
                        guildId: interaction.guildId!,
                    },
                });

                await interaction.followUp({
                    embeds: [successEmbed("Role picker created")],
                    ephemeral: true,
                });
                break;
            case "add":
                await client.prisma.rolePicker.update({
                    where: {
                        name: interaction.options.getString("id", true),
                    },
                    data: {
                        Roles: {
                            connectOrCreate: {
                                where: {
                                    id: interaction.options.getRole("role", true).id,
                                },
                                create: {
                                    id: interaction.options.getRole("role", true).id,
                                },
                            },
                        },
                    },
                });

                await interaction.followUp({
                    embeds: [successEmbed("Role added to the picker")],
                    ephemeral: true,
                });
                break;
            case "remove":
                await client.prisma.rolePicker.update({
                    where: {
                        name: interaction.options.getString("id", true),
                    },
                    data: {
                        Roles: {
                            disconnect: {
                                id: interaction.options.getRole("role", true).id,
                            },
                        },
                    },
                });

                await interaction.followUp({
                    embeds: [successEmbed("Role removed from the picker")],
                    ephemeral: true,
                });
                break;
        }
    },
};
