import { SchedulerRegistry } from "@nestjs/schedule";
import { Test, TestingModule } from "@nestjs/testing";

import { WebClient } from "@slack/web-api";
import { IncomingWebhook } from "@slack/webhook";

import { Client } from "discord.js";

import { MessagingService } from "../src/service";

describe("MessagingService", () => {
	let service: MessagingService;
	let schedulerRegistry: SchedulerRegistry;

	// Mock dependencies
	const mockSlackWebClient = {
		chat: {
			postMessage: jest.fn(),
		},
	} as unknown as WebClient;

	const mockSlackWebhook = {
		send: jest.fn(),
	} as unknown as IncomingWebhook;

	const mockDiscordClient = {
		login: jest.fn(),
		channels: {
			fetch: jest.fn(),
		},
	} as unknown as Client;

	const mockOptions = {
		debug: true,
		platforms: {
			slack: {
				token: "slack-token",
				webhookUrl: "slack-webhook",
			},
			discord: {
				token: "discord-token",
			},
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MessagingService,
				{
					provide: "MESSAGING_OPTIONS",
					useValue: mockOptions,
				},
				{
					provide: SchedulerRegistry,
					useValue: {
						addCronJob: jest.fn(),
						deleteCronJob: jest.fn(),
						getCronJob: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<MessagingService>(MessagingService);
		schedulerRegistry = module.get(SchedulerRegistry);

		// Use Object.defineProperty to bypass private access
		Object.defineProperty(service, "slackWebhook", {
			value: mockSlackWebhook,
			writable: true,
		});

		Object.defineProperty(service, "slackClient", {
			value: mockSlackWebClient,
			writable: true,
		});

		Object.defineProperty(service, "discordClient", {
			value: mockDiscordClient,
			writable: true,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("Initialization", () => {
		it("should be defined", () => {
			expect(service).toBeDefined();
		});

		it("should set debug flag from options", () => {
			const debugValue = Reflect.get(service, "debug");
			expect(debugValue).toBe(true);
		});
	});

	describe("sendMessage", () => {
		it("should send Slack message using WebClient", async () => {
			(mockSlackWebClient.chat.postMessage as jest.Mock).mockResolvedValue({
				ts: "1234",
			});

			const result = await service.sendMessage({
				slack: {
					channel: "#test",
					text: "Hello Slack",
				},
			});

			expect(result.slack).toBeDefined();
			expect(mockSlackWebClient.chat.postMessage).toHaveBeenCalledWith(
				expect.objectContaining({
					channel: "#test",
					text: "Hello Slack",
				})
			);
		});

		it("should handle scheduling messages", async () => {
			const scheduleOptions = {
				schedule: {
					time: new Date(Date.now() + 2 * 60 * 1000),
					timezone: "UTC",
				},
				slack: {
					channel: "#test",
					text: "Scheduled message",
				},
			};

			const result = await service.sendMessage(scheduleOptions);

			expect(result.scheduled).toBe(true);
			expect(result.jobDetails).toBeDefined();
		});
	});

	describe("cancelScheduledMessage", () => {
		it("should successfully cancel a scheduled message", () => {
			const mockJob = {
				stop: jest.fn(),
			};

			(schedulerRegistry.getCronJob as jest.Mock).mockReturnValue(mockJob);

			const result = service.cancelScheduledMessage("test-job");

			expect(result).toBe(true);
			expect(mockJob.stop).toHaveBeenCalled();
			expect(schedulerRegistry.deleteCronJob).toHaveBeenCalledWith("test-job");
		});

		it("should handle errors when cancelling a job", () => {
			(schedulerRegistry.getCronJob as jest.Mock).mockImplementation(() => {
				throw new Error("Job not found");
			});

			const result = service.cancelScheduledMessage("non-existent-job");

			expect(result).toBe(false);
		});
	});

	describe("Error Handling", () => {
		it("should handle Slack message sending errors", async () => {
			(mockSlackWebClient.chat.postMessage as jest.Mock).mockRejectedValue(
				new Error("Slack error")
			);

			const result = await service.sendMessage({
				slack: {
					channel: "#test",
					text: "Error message",
				},
			});

			expect((result.slack as { error?: Error }).error).toBeDefined();
		});
	});

	describe("Platform-Specific Features", () => {
		it("should support Slack thread messages", async () => {
			(mockSlackWebClient.chat.postMessage as jest.Mock).mockResolvedValue({
				ts: "1234",
			});

			await service.sendMessage({
				slack: {
					channel: "#test",
					text: "Thread message",
					threadTs: "parent-thread-id",
				},
			});

			expect(mockSlackWebClient.chat.postMessage).toHaveBeenCalledWith(
				expect.objectContaining({
					thread_ts: "parent-thread-id",
				})
			);
		});
	});
});
