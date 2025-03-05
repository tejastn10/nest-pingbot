<p align="center">
  <img src="logo.svg" alt="Logo">
</p>

# Nest Pingbot 🔔

![Node.js Version](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-007ACC?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10%2B-E0234E?logo=nestjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?logo=open-source-initiative&logoColor=white)
[![NPM Version](https://img.shields.io/npm/v/nest-pingbot?logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/nest-pingbot)
[![Unit Tests](https://github.com/tejastn10/nest-pingbot/actions/workflows/unit-test.yml/badge.svg)](https://github.com/tejastn10/nest-pingbot/actions/workflows/unit-test.yml)
[![Publish NPM Package](https://github.com/tejastn10/nest-pingbot/actions/workflows/publish.yml/badge.svg)](https://github.com/tejastn10/nest-pingbot/actions/workflows/publish.yml)

**Nest Pingbot** is a flexible NestJS module for integrating Slack and Discord messaging capabilities into your applications. Send notifications, alerts, and messages to your team's communication channels directly from your NestJS application.

---

## Features ⚡

- **Multi-Platform Support**: Send messages to both Slack and Discord from a single interface
- **Platform-Specific Features**:
  - **Slack**: Support for Block Kit UI elements, thread replies, and rich formatting
  - **Discord**: Support for embeds and advanced message formatting
- **Flexible Configuration**:
  - Use only Slack, only Discord, or both simultaneously
  - Clear error handling when platforms aren't configured
- **Type Safety**:
  - Full TypeScript support with proper interfaces for all message components
  - Dedicated types for Slack Block Kit components
- **Developer Experience**:
  - Simple integration with any NestJS application
  - Comprehensive test coverage
  - Well-documented API

---

## Installation ⚙️

```bash
npm install nest-pingbot
```

## Usage 🚀

### Module Registration

You can register the module in multiple ways:

#### Basic Registration

```typescript
import { Module } from '@nestjs/common';
import { MessagingModule, MessagePlatform } from 'nest-pingbot';

@Module({
  imports: [
    MessagingModule.register({
      platforms: {
        slack: {
          token: 'your-slack-token',
          // or
          webhookUrl: 'your-slack-webhook-url',
        },
        discord: {
          token: 'your-discord-token',
        },
      },
      defaultPlatform: MessagePlatform.SLACK,
      debug: true, // Optional debugging
    }),
  ],
})
export class AppModule {}
```

#### Global Registration

```typescript
import { Module } from '@nestjs/common';
import { MessagingModule } from 'nest-pingbot';

@Module({
  imports: [
    MessagingModule.forRoot({
      platforms: {
        slack: {
          token: process.env.SLACK_TOKEN,
        },
      },
      debug: true,
    }),
  ],
})
export class AppModule {}
```

#### Async Registration

```typescript
import { Module } from '@nestjs/common';
import { MessagingModule } from 'nest-pingbot';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MessagingModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        platforms: {
          slack: {
            token: configService.get('SLACK_TOKEN'),
          },
          discord: {
            token: configService.get('DISCORD_TOKEN'),
          },
        },
        debug: configService.get('NODE_ENV') !== 'production',
      }),
    }),
  ],
})
export class AppModule {}
```

### Sending Messages

Inject the MessagingService into your controllers or services:

```typescript
import { Injectable } from '@nestjs/common';
import { MessagingService } from 'nest-pingbot';

@Injectable()
export class NotificationService {
  constructor(private readonly messagingService: MessagingService) {}

  async sendAlert(message: string) {
    return this.messagingService.sendMessage({
      slack: {
        channel: 'alerts',
        text: message,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'New Alert',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message,
            },
          },
        ],
      },
      discord: {
        channelId: '1234567890123456789',
        content: 'New Alert',
        embeds: [
          {
            title: 'Alert',
            description: message,
            color: 0xff0000,
            timestamp: new Date(),
          },
        ],
      },
    });
  }

  async scheduleReminder(message: string, scheduledTime: Date) {
    return this.messagingService.sendMessage({
      slack: {
        channel: 'reminders',
        text: `Reminder: ${message}`,
      },
      schedule: {
        time: scheduledTime,
      },
    });
  }
}
```

### Working with Threads

#### Slack Threads

```typescript
async continueSlackThread(threadTs: string, message: string) {
  return this.messagingService.sendMessage({
    slack: {
      channel: 'general',
      text: message,
      threadTs: threadTs,
    },
  });
}
```

#### Discord Threads

```typescript
async continueDiscordThread(channelId: string, threadId: string, message: string) {
  return this.messagingService.sendMessage({
    discord: {
      channelId: channelId,
      threadId: threadId,
      content: message,
    },
  });
}
```

## API Reference 📒

### MessagingService

The main service for sending messages:

- `sendMessage(options: MessageOptions): Promise<any>` - Send messages to one or both platforms

### MessageOptions

```typescript
interface MessageOptions {
  slack?: SlackMessageOptions;
  discord?: DiscordMessageOptions;
  schedule?: ScheduleOptions;
}
```

### SlackMessageOptions

```typescript
interface SlackMessageOptions {
  channel: string;
  text?: string;
  blocks?: SlackBlock[];
  threadTs?: string;
  unfurlLinks?: boolean;
  unfurlMedia?: boolean;
  mrkdwn?: boolean;
}
```

### DiscordMessageOptions

```typescript
interface DiscordMessageOptions {
  channelId: string;
  content?: string;
  embeds?: DiscordEmbed[];
  threadId?: string;
  components?: any[];
}
```

### ScheduleOptions

```typescript
interface ScheduleOptions {
  time: Date;
  timezone?: string;
}
```

## Testing 🧪

The module includes comprehensive tests:

```bash
# Run unit tests
npm test
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📜

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

---

## Acknowledgments 🙌

- Built with **NestJS** for a structured and scalable messaging solution.
- Inspired by the need for simple, unified messaging across different platforms.
- Made with ❤️ for developers who need reliable communication integrations.
