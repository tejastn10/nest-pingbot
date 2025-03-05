import { DynamicModule, Module, Provider } from "@nestjs/common";

import { ScheduleModule } from "@nestjs/schedule";

import { MessagingService } from "./service";

import {
	MessagingModuleAsyncOptions,
	MessagingModuleOptions,
	MessagingOptionsFactory,
} from "./interfaces";

/**
 * MessagingModule provides a flexible configuration system for messaging services
 *
 * This module supports multiple ways of configuration:
 * 1. Static configuration with predefined options
 * 2. Async configuration with dynamic option generation
 * 3. Global module registration
 */
@Module({
	imports: [ScheduleModule.forRoot()],
	providers: [MessagingService],
	exports: [MessagingService],
})
export class MessagingModule {
	/**
	 * Registers the module with static options
	 *
	 * @param options Configuration options for messaging services
	 * @returns A dynamic module with specified configuration
	 *
	 * Example usage:
	 * ```typescript
	 * MessagingModule.register({
	 *   platforms: {
	 *     slack: { token: 'xxx' },
	 *     discord: { token: 'yyy' }
	 *   }
	 * })
	 * ```
	 */
	static register(options: MessagingModuleOptions): DynamicModule {
		return {
			module: MessagingModule,
			providers: [
				{
					provide: "MESSAGING_OPTIONS",
					useValue: options,
				},
				MessagingService,
			],
			exports: [MessagingService],
		};
	}

	/**
	 * Registers the module with async options
	 *
	 * @param options Asynchronous configuration options
	 * @returns A dynamic module with async configuration
	 *
	 * Supports multiple async configuration strategies:
	 * 1. useFactory: Provides options via a factory function
	 * 2. useClass: Uses a class to generate options
	 * 3. useExisting: Uses an existing provider to generate options
	 */
	static registerAsync(options: MessagingModuleAsyncOptions): DynamicModule {
		return {
			module: MessagingModule,
			imports: options.imports || [],
			providers: [...this.createAsyncProviders(options), MessagingService],
			exports: [MessagingService],
		};
	}

	/**
	 * Registers the module globally with static options
	 *
	 * @param options Configuration options for messaging services
	 * @returns A global dynamic module
	 *
	 * Global modules are automatically imported across the entire application
	 * Useful for core services that should be available everywhere
	 */
	static forRoot(options: MessagingModuleOptions): DynamicModule {
		return {
			module: MessagingModule,
			global: true,
			providers: [
				{
					provide: "MESSAGING_OPTIONS",
					useValue: options,
				},
				MessagingService,
			],
			exports: [MessagingService],
		};
	}

	/**
	 * Registers the module globally with async options
	 *
	 * @param options Asynchronous configuration options
	 * @returns A global dynamic module with async configuration
	 */
	static forRootAsync(options: MessagingModuleAsyncOptions): DynamicModule {
		return {
			module: MessagingModule,
			global: true,
			imports: options.imports || [],
			providers: [...this.createAsyncProviders(options), MessagingService],
			exports: [MessagingService],
		};
	}

	/**
	 * Creates async providers for module configuration
	 *
	 * @param options Async configuration options
	 * @returns An array of providers for async module setup
	 *
	 * Handles different async configuration strategies:
	 * - useFactory: Direct factory function
	 * - useClass: Class-based option generation
	 * - useExisting: Existing provider-based option generation
	 */
	private static createAsyncProviders(options: MessagingModuleAsyncOptions): Provider[] {
		if (options.useExisting || options.useFactory) {
			return [this.createAsyncOptionsProvider(options)];
		}

		return [
			this.createAsyncOptionsProvider(options),
			{
				provide: options.useClass,
				useClass: options.useClass,
			},
		];
	}

	/**
	 * Creates an async options provider
	 *
	 * @param options Async configuration options
	 * @returns A provider for generating module options
	 *
	 * Supports multiple async configuration methods:
	 * 1. Direct useFactory function
	 * 2. Class-based option generation via createMessagingOptions method
	 */
	private static createAsyncOptionsProvider(options: MessagingModuleAsyncOptions): Provider {
		if (options.useFactory) {
			return {
				provide: "MESSAGING_OPTIONS",
				useFactory: options.useFactory,
				inject: options.inject || [],
			};
		}

		return {
			provide: "MESSAGING_OPTIONS",
			useFactory: async (optionsFactory: MessagingOptionsFactory) =>
				await optionsFactory.createMessagingOptions(),
			inject: [options.useExisting || options.useClass],
		};
	}
}
