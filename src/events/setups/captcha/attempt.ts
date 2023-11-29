import { Events, type Message } from "discord.js";
import type { Event } from "@/events/index.js";
import { logger } from "@/utils/log.js";

export const event: Event = {
    name: Events.MessageCreate,
    async callback(client, message: Message) {
        if (!message.inGuild) return;
        const captchaSetup = await client.prisma.captchaSetup.findUnique({
            where: {
                guildId: message.guild!.id,
            },
        });
        if (!captchaSetup) return;
        if (message.channelId !== captchaSetup.channelId) return;

        const captchaCode = await client.prisma.captchaCode.findUnique({
            where: {
                unique_captcha_code: {
                    memberId: message.author.id,
                    guildId: message.guild!.id,
                },
            },
        });
        if (!captchaCode) return;

        await message.delete();
        if (message.content === captchaCode.code) {
            message.member!.roles.add(captchaSetup.roleId);
            const captchaMessage = message.channel.messages.cache.get(captchaCode.messageId);
            if (captchaMessage) await captchaMessage.delete();
            logger.debug(`Captcha passed for ${message.author.tag} (${message.author.id})`);
        } else {
            logger.debug(`Captcha failed for ${message.author.tag} (${message.author.id})`);
        }
    },
};
