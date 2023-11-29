import { Events, TextChannel, type GuildMember } from "discord.js";
import type { Event } from "@/events/index.js";
import { Captcha as CaptchaGenerator } from "captcha-canvas";

export const event: Event = {
    name: Events.GuildMemberAdd,
    async callback(client, member: GuildMember) {
        const captchaSetup = await client.prisma.captchaSetup.findUnique({
            where: {
                guildId: member.guild.id,
            },
        });
        if (!captchaSetup) return;

        const channel = client.channels.cache.get(captchaSetup.channelId);
        if (!channel || !channel.isTextBased()) return;

        const captcha = new CaptchaGenerator();
        captcha.drawTrace();
        captcha.drawCaptcha();

        const message = await channel.send({
            content: `<@${member.id}>`,
            embeds: [
                {
                    title: "Bienvenue sur le serveur !",
                    description: "Pour accéder au serveur, veuillez recopier le captcha ci-dessous :",
                    image: {
                        url: `attachment://captcha.png`,
                    },
                },
            ],
            files: [
                {
                    attachment: await captcha.png,
                    name: "captcha.png",
                },
            ],
        });

        await client.prisma.captchaCode.upsert({
            where: {
                unique_captcha_code: {
                    memberId: member.id,
                    guildId: member.guild.id,
                },
            },
            create: {
                memberId: member.id,
                guildId: member.guild.id,
                messageId: message.id,
                code: captcha.text,
            },
            update: {
                code: captcha.text,
            },
        });
    },
};
