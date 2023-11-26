import type { Interaction } from "discord.js";
import { Events } from "discord.js";
import type { Event } from "@/events/index.js";
import { errorEmbed } from "@/utils/embeds.js";
import { logger } from "@/utils/log.js";

export const event: Event = {
    name: Events.InteractionCreate,
    async callback(client, interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;
        try {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            logger.debug(`Command ${command.name} called by ${interaction.user.tag} (${interaction.user.id})`);
            await interaction.deferReply();
            await command.callback(client, interaction);
            if (interaction.deferred) await interaction.deleteReply();
        } catch (error) {
            if (!interaction.deferred) await interaction.deferReply();
            await interaction.followUp({
                embeds: [errorEmbed("An error occurred")],
            });
            logger.error(error);
        }
    },
};
