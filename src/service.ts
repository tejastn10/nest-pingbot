import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { SchedulerRegistry } from "@nestjs/schedule";

import { CronJob } from "cron";

import {
	ChatPostMessageArguments,
	ChatPostMessageResponse,
	ChatScheduleMessageArguments,
	WebClient,
} from "@slack/web-api";
import { IncomingWebhook, IncomingWebhookResult } from "@slack/webhook";

import { Client, GatewayIntentBits, TextChannel, MessageCreateOptions } from "discord.js";

import {
	// ? Module options
	MessagingModuleOptions,

	// ? Message options
	MessageOptions,

	// ? Platform configs
	SlackMessageOptions,
	DiscordMessageOptions,
} from "./interfaces";

@Injectable()
export class MessagingService implements OnModuleInit {
	private readonly logger = new Logger(MessagingService.name);

	// Slack clients
	private slackClient?: WebClient;
	private slackWebhook?: IncomingWebhook;

	// Discord client
	private discordClient?: Client;

	// Configuration
	private debug: boolean;

	constructor(
		@Inject("MESSAGING_OPTIONS")
		private readonly options: MessagingModuleOptions,
		private schedulerRegistry: SchedulerRegistry
	) {
		this.debug = this.options.debug || false;
	}

	/**
	 * Initializes messaging clients when the module starts.
	 * Sets up Slack and Discord clients based on provided configuration.
	 * Logs initialization status and potential errors.
	 */
	async onModuleInit(): Promise<void> {
		await this.initializeClients();
	}

	/**
	 * Configures messaging clients for Slack and Discord.
	 *
	 * @throws {Error} If client initialization fails
	 * @returns A promise that resolves when all configured clients are initialized
	 */
	private async initializeClients(): Promise<void> {
		const { platforms } = this.options;

		// Initialize Slack clients
		if (platforms?.slack) {
			if (platforms.slack.token) {
				this.slackClient = new WebClient(platforms.slack.token);
				this.logger.log("Slack client initialized with token");
			}

			if (platforms.slack.webhookUrl) {
				this.slackWebhook = new IncomingWebhook(platforms.slack.webhookUrl);
				this.logger.log("Slack webhook initialized");
			}
		}

		// Initialize Discord client
		if (platforms?.discord?.token) {
			this.discordClient = new Client({
				intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
			});

			try {
				await this.discordClient.login(platforms.discord.token);
				this.logger.log("Discord client initialized and logged in");
			} catch (error) {
				this.logger.error(`Discord login failed: ${error.message}`);
				this.discordClient = undefined;
			}
		}

		// Validate client initialization
		if (!this.slackClient && !this.slackWebhook && !this.discordClient) {
			this.logger.warn("No messaging clients initialized. Please provide valid credentials.");
		}
	}

	/**
	 * Sends messages to configured platforms (Slack and/or Discord).
	 *
	 * @param options Configuration for message sending, including platform-specific details
	 * @returns Promise resolving to results from each platform
	 */
	async sendMessage(options: MessageOptions): Promise<Record<string, unknown>> {
		const results: Record<string, unknown> = {};

		// Handle scheduled messages
		if (options.schedule) {
			return this.scheduleMessage(options);
		}

		// Send to Slack
		if (options.slack && (this.slackClient || this.slackWebhook)) {
			try {
				results.slack = await this.sendSlackMessage(options.slack);
				this.logger.log("Slack message sent successfully");
			} catch (error) {
				this.logger.error(`Error sending Slack message: ${error.message}`);
				results.slack = { error: error.message };
			}
		}

		// Send to Discord
		if (options.discord && this.discordClient) {
			try {
				results.discord = await this.sendDiscordMessage(options.discord);
				this.logger.log("Discord message sent successfully");
			} catch (error) {
				this.logger.error(`Error sending Discord message: ${error.message}`);
				results.discord = { error: error.message };
			}
		}

		return results;
	}

	/**
	 * Schedules a message to be sent at a specified time.
	 *
	 * @param options Message options including scheduling details
	 * @returns Job information with scheduling metadata
	 * @throws {Error} If schedule options are invalid
	 */
	private scheduleMessage(options: MessageOptions): Record<string, unknown> {
		// Validate schedule options
		if (!options.schedule) {
			throw new Error("Schedule options are required");
		}

		const {
			time,
			timezone = "UTC", // Default timezone if not provided
		} = options.schedule;

		// Create a copy of options without the schedule to avoid recursion
		const messageOptions = { ...options };
		delete messageOptions.schedule;

		// Generate a unique job name
		const jobName = `message-${Date.now()}`;

		// Create a new cron job
		const job = new CronJob(
			time,
			() => {
				this.logger.log(`Executing scheduled message at ${new Date().toISOString()}`);

				try {
					this.sendMessage(messageOptions);
				} catch (error) {
					this.logger.error(`Failed to send scheduled message: ${error.message}`);
				}
			},
			null,
			false,
			timezone
		);

		// Add the job to the scheduler registry
		this.schedulerRegistry.addCronJob(jobName, job);

		// Start the job
		job.start();

		return {
			scheduled: true,
			nextInvocation: job.nextDate().toJSDate(),
			jobDetails: {
				name: jobName,
				scheduled: true,
				timezone: timezone,
			},
		};
	}

	/**
	 * Cancels a previously scheduled message job.
	 *
	 * @param jobName Unique identifier of the job to cancel
	 * @returns Boolean indicating whether the job was successfully cancelled
	 */
	cancelScheduledMessage(jobName: string): boolean {
		try {
			const job = this.schedulerRegistry.getCronJob(jobName);
			job.stop();
			this.schedulerRegistry.deleteCronJob(jobName);
			this.logger.log(`Scheduled message job ${jobName} cancelled successfully`);
			return true;
		} catch (error) {
			this.logger.error(`Failed to cancel job ${jobName}: ${error.message}`);
			return false;
		}
	}

	/**
	 * Send a message to Slack
	 * @param options Slack-specific message options
	 * @returns Result from Slack API
	 */
	private async sendSlackMessage(
		options: SlackMessageOptions
	): Promise<ChatPostMessageResponse | IncomingWebhookResult> {
		// Prefer WebClient over webhook if both are available
		if (this.slackClient) {
			const params: ChatPostMessageArguments | ChatScheduleMessageArguments = {
				channel: options.channel,
				text: options.text || "",
			};

			if (options.blocks) {
				// @ts-expect-error - Not sure why but the type is defined properly
				params.blocks = options.blocks;
			}

			if (options.threadTs) {
				params.thread_ts = options.threadTs;
			}

			if (Object.prototype.hasOwnProperty.call(options, "unfurlLinks")) {
				params.unfurl_links = options.unfurlLinks;
			}

			if (Object.prototype.hasOwnProperty.call(options, "unfurlMedia")) {
				params.unfurl_media = options.unfurlMedia;
			}

			if (Object.prototype.hasOwnProperty.call(options, "mrkdwn")) {
				params.mrkdwn = options.mrkdwn;
			}

			return await this.slackClient.chat.postMessage(params);
		} else if (this.slackWebhook) {
			// Use webhook as fallback
			return await this.slackWebhook.send({
				text: options.text,
				blocks: options.blocks,
				channel: options.channel,
			});
		} else {
			throw new Error("No Slack client initialized");
		}
	}

	/**
	 * Send a message to Discord
	 * @param options Discord-specific message options
	 * @returns Result from Discord API
	 */
	private async sendDiscordMessage(options: DiscordMessageOptions): Promise<unknown> {
		if (!this.discordClient) {
			throw new Error("Discord client not initialized");
		}

		const channel = (await this.discordClient.channels.fetch(
			options.threadId || options.channelId
		)) as TextChannel;

		if (!channel) {
			throw new Error(`Channel or thread not found: ${options.channelId}`);
		}

		const messageOptions = {
			content: options.content,
			embeds: options.embeds,
			components: options.components,
		} as unknown as MessageCreateOptions;

		if (options.threadId && !options.channelId) {
			// We're already targeting the thread directly
			return await channel.send(messageOptions);
		} else if (options.threadId) {
			// We need to get the thread from the channel
			const thread = channel.threads.cache.get(options.threadId);
			if (!thread) {
				throw new Error(`Thread not found: ${options.threadId}`);
			}
			return await thread.send(messageOptions);
		} else {
			// Regular channel message
			return await channel.send(messageOptions);
		}
	}
}
