import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { RequestMiddleware } from "./middleware/request.middleware";
import { RequestMiddlewareOptions } from "./options";

import { AppController } from "./app.controller";

import { ConfigModule } from "./config/config.module";
import { SwaggerModule } from "./docs/swagger/swagger.module";

import { DatabaseModule } from "./database/database.module";

import { CoreModule } from "./core/core.module";
import { CruxModule } from "./crux/crux.module";

@Module({
	imports: [
		// Configs
		ConfigModule,
		SwaggerModule,
		TerminusModule,

		// Database
		DatabaseModule,

		// Main Modules
		CoreModule,
		CruxModule,
	],
	controllers: [AppController],
	providers: [],
	exports: [],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(RequestMiddleware).forRoutes(RequestMiddlewareOptions);
	}
}
