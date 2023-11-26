import { Events, type Interaction, type GuildMemberRoleManager } from "discord.js";
import type { Event } from "@/events/index.js";

export const event: Event = {
    name: Events.InteractionCreate,
    async callback(_, interaction: Interaction) {
        if (interaction.isButton() && interaction.customId.startsWith("pick-role")) {
            await interaction.deferUpdate();
            if (!interaction.member) return;

            const roleID = interaction.customId.split("-")[2];
            if (!roleID) return;

            if ((interaction.member.roles as GuildMemberRoleManager).cache.has(roleID)) {
                (interaction.member.roles as GuildMemberRoleManager).remove(roleID);
            } else {
                (interaction.member.roles as GuildMemberRoleManager).add(roleID);
            }
        }
    },
};
