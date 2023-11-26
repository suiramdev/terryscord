import type { APIEmbed } from "discord.js";

export const errorEmbed = (message: string): APIEmbed => {
    return {
        title: "Erreur",
        description: message,
        color: 0xed4245,
    };
};

export const successEmbed = (message: string): APIEmbed => {
    return {
        title: "Succès",
        description: message,
        color: 0x3aa55c,
    };
};
