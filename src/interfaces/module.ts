import { InjectionToken, ModuleMetadata, OptionalFactoryDependency, Type } from "@nestjs/common";

import { PlatformConfigs } from "./platforms";

export interface MessagingModuleOptions {
	platforms: PlatformConfigs;

	debug?: boolean;
}

export interface MessagingOptionsFactory {
	createMessagingOptions(): Promise<MessagingModuleOptions> | MessagingModuleOptions;
}

export interface MessagingModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
	inject?: (InjectionToken | OptionalFactoryDependency)[];

	useClass?: Type<MessagingOptionsFactory>;
	useExisting?: Type<MessagingOptionsFactory>;

	useFactory?: (...args: unknown[]) => Promise<MessagingModuleOptions> | MessagingModuleOptions;
}
