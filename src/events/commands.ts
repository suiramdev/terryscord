import type { Interaction } from "discord.js";
import { Events } from "discord.js";
import type { Event } from "@/events/index.js";
import { errorEmbed } from "@/utils/embeds.js";
import { logger } from "@/utils/log.js";

export const event: Event = {
    name: Events.InteractionCreate,
    async callback(client, interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await interaction.deferReply({ ephemeral: true });
        logger.debug(`Command ${command.name} called by ${interaction.user.tag} (${interaction.user.id})`);
        command.callback(client, interaction).catch((error) => {
            logger.error(error);
            interaction.followUp({
                embeds: [errorEmbed("An error occurred")],
                ephemeral: true,
            });
        });
    },
};
