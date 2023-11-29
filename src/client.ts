import path from "node:path";
import type { Command } from "@/commands/index.js";
import { Client as DiscordClient, type ClientOptions, Collection, Events } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { logger } from "@/utils/log.js";
import type { Event } from "@/events/index.js";
import { getDirName, processFiles } from "@/utils/files.js";

export class Client extends DiscordClient {
    public commands = new Collection<string, Command>();
    public prisma = new PrismaClient();

    constructor(options: ClientOptions) {
        super(options);

        this.on(Events.ClientReady, () => {
            logger.info("Client ready");
        });
    }

    /**
     * Login to Discord and connect to database
     * @param token - The token to login with
     * @throws If the client fails to login, or if the database connection fails
     */
    public async login(token: string): Promise<string> {
        try {
            await this.prisma.$connect();
            logger.info("Connected to database");
        } catch (error) {
            logger.error("Couldn't connect to database");
            logger.error(error);
            throw error;
        }

        try {
            const promise = super.login(token);
            return promise;
        } catch (error) {
            logger.error("Couldn't login to Discord");
            logger.error(error);
            throw error;
        }
    }

    public async loadEvents(): Promise<void> {
        await processFiles(path.resolve(getDirName(import.meta.url), "./events"), {
            filter: (file) => file.endsWith(".js") || file.endsWith(".ts"),
            apply: async (file) => {
                if (file.split(path.sep).includes("dev") && process.env.NODE_ENV !== "development") {
                    logger.info("Skipped %s", file);
                    return;
                }

                try {
                    const { event }: { event: Event } = await import(file);
                    if (!event) return;
                    this.on(event.name, event.callback.bind(null, this));
                    logger.info("Loaded %s", file);
                } catch (error) {
                    logger.error("Couldn't load %s", file);
                    logger.error(error);
                }
            },
        });
    }

    public async loadCommands(): Promise<void> {
        this.commands.clear();
        await processFiles(path.resolve(getDirName(import.meta.url), "./commands"), {
            filter: (file) => file.endsWith(".js") || file.endsWith(".ts"),
            apply: async (file) => {
                if (file.split(path.sep).includes("dev") && process.env.NODE_ENV !== "development") {
                    logger.info("Skipped %s", file);
                    return;
                }

                try {
                    const { command }: { command: Command } = await import(file);
                    if (!command) return;
                    await this.application?.commands.create(command);
                    this.commands.set(command.name, command);
                    logger.info("Loaded %s", file);
                } catch (error) {
                    logger.error("Couldn't load %s", file);
                    logger.error(error);
                }
            },
        });
    }
}
