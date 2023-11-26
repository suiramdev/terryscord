import { Client } from "@/client.js";
import Parser from "rss-parser";
import { Events } from "discord.js";
import type { Event } from "@/events/index.js";
import { logger } from "@/utils/log.js";

const textOverflow = (text: string, length: number) => {
    if (text.length > length) return text.substring(0, length) + "...";
    return text;
};

async function rssLookup(client: Client) {
    try {
        const feedSubscriptions = await client.prisma.feedSubscription.findMany();
        const parser = new Parser();

        for (const feedSubscription of feedSubscriptions) {
            const channel = client.channels.cache.get(feedSubscription.channelId);
            if (!channel || !channel.isTextBased()) continue;

            // Get all items that are newer than the last update and sort them by date
            const items = (await parser.parseURL(feedSubscription.feedUrl)).items
                .filter((item) => item.isoDate && new Date(item.isoDate) >= new Date(feedSubscription.lastUpdate))
                .sort((a, b) => new Date(a.isoDate!).valueOf() - new Date(b.isoDate!).valueOf());

            for (const item of items) {
                await channel.send({
                    embeds: [
                        {
                            author: {
                                name: item.author || item.creator,
                            },
                            title: item.title,
                            description: textOverflow(item.contentSnippets, 200),
                            url: item.link,
                            timestamp: item.isoDate,
                        },
                    ],
                });
            }

            await client.prisma.feedSubscription.update({
                where: {
                    id: feedSubscription.id,
                },
                data: {
                    lastUpdate: new Date().toISOString(),
                },
            });
        }

        setTimeout(() => rssLookup(client), 1000 * 60 * 5);
    } catch (error) {
        logger.error(error);
    }
}

export const event: Event = {
    name: Events.ClientReady,
    async callback(client) {
        rssLookup(client);
    },
};
