import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";

import helmet from "@fastify/helmet";

import { ExceptionInterceptor } from "./interceptors/exception.interceptor";

import {
	CorsOptions,
	NestOptions,
	HelmetOptions,
	SwaggerOptions,
	VersioningOptions,
	ValidationPipeOptions,
} from "./options";

import { AppModule } from "./app.module";

import { ConfigModule } from "./config/config.module";
import { SwaggerModule } from "./docs/swagger/swagger.module";

import { ConfigService } from "./config/config.service";
import { SwaggerService } from "./docs/swagger/swagger.service";

const bootstrap = async (): Promise<void> => {
	const FastifyModule = new FastifyAdapter();

	// Enabling things for Fastify server
	FastifyModule.register(helmet, HelmetOptions);
	FastifyModule.enableCors(CorsOptions);

	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		FastifyModule,
		NestOptions
	);

	// Versioning
	app.enableVersioning(VersioningOptions);

	// Swagger implementation
	const swaggerService = app.select(SwaggerModule).get(SwaggerService);
	swaggerService.createDocument(app, SwaggerOptions);

	// Middlewares, Interceptors & Pipes
	app.useGlobalPipes(new ValidationPipe(ValidationPipeOptions));
	app.useGlobalInterceptors(new ExceptionInterceptor());

	// Config implementation
	const configService = app.select(ConfigModule).get(ConfigService);
	const MODE = configService.getString("MODE") || "DEV";
	const PORT = configService.getNumber("PORT") || 5000;

	await app.listen(
		{
			port: PORT,
		},
		(error, address) => {
			if (error) {
				Logger.error(`Failed to start server: ${error.message}`, "Server");
				return;
			}

			Logger.verbose(`Server listening on port:${PORT}`, "SERVER");
			Logger.verbose(`IPv4: http://localhost:${PORT}`, "SERVER");
			Logger.verbose(`IPv6: ${address}`, "SERVER");

			Logger.debug(`Server running in ${MODE} mode`, "SERVER");
		}
	);
};

bootstrap();
