export enum MessagePlatform {
	SLACK = "slack",
	DISCORD = "discord",
}

export interface SlackConfig {
	token?: string;
	webhookUrl?: string;
}

export interface DiscordConfig {
	token?: string;
}

export interface PlatformConfigs {
	slack?: SlackConfig;
	discord?: DiscordConfig;
}
