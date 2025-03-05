import { AnyBlock, Block, KnownBlock } from "@slack/web-api";

import { EmbedData } from "discord.js";

// ? Slack types
interface SlackMessageOptions {
	channel: string;

	text?: string;
	blocks?: (KnownBlock | Block)[];

	threadTs?: string;

	unfurlLinks?: boolean;
	unfurlMedia?: boolean;

	mrkdwn?: boolean;
}

// ? Discord types
interface DiscordMessageOptions {
	channelId: string;

	content?: string;
	embeds?: EmbedData[];

	threadId?: string;

	components?: unknown[];
}

// * Common message options
interface ScheduleOptions {
	time: Date;

	timezone?: string;
}

interface MessageOptions {
	slack?: SlackMessageOptions;
	discord?: DiscordMessageOptions;

	schedule?: ScheduleOptions;
}

export {
	// ? Message types
	Block,
	AnyBlock,
	KnownBlock,
	EmbedData,
	// ? Message options
	MessageOptions,
	SlackMessageOptions,
	DiscordMessageOptions,
	ScheduleOptions,
};
