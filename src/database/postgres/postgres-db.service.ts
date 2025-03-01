import { Injectable, Logger } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

import { ConfigService } from "../../config/config.service";

import { initializeDatabaseConnection } from "../database.connection";

@Injectable()
export class PostgresDBService implements TypeOrmOptionsFactory {
	constructor(private readonly configService: ConfigService) {}

	private readonly logger = new Logger(PostgresDBService.name);

	async onModuleInit(): Promise<void> {
		const options = this.createTypeOrmOptions();
		await initializeDatabaseConnection({
			...options,
			type: "postgres",
		});
	}

	createTypeOrmOptions(): TypeOrmModuleOptions {
		const postgresTypeOrmOptions: TypeOrmModuleOptions = {
			// Application Name
			applicationName: this.configService.getString("POSTGRES_APP_NAME") || "Hearth",

			// Default options
			type: "postgres",
			url: this.configService.getString("POSTGRES_URL"),
			synchronize: this.configService.getString("MODE") === "DEV",
			autoLoadEntities: true,

			// Connection pool settings
			poolSize: this.configService.getNumber("POSTGRES_POOL_SIZE") || 10, // Default pool size

			// Logging options
			logging: this.configService.getString("POSTGRES_LOGGING") === "true", // Enable logging
			logger: "debug", // Logger type
			logNotifications: true,
			verboseRetryLog: true,

			// Other PostgreSQL specific options
			connectTimeoutMS: this.configService.getNumber("POSTGRES_CONNECT_TIMEOUT") || 5000, // Connection timeout in milliseconds

			poolErrorHandler: (error: Error) => {
				this.logger.error(`Postgres error occurred: ${error.message}`);
			},

			// ? Optionally define migrations
			// migrations: [__dirname + "/migrations/*{.ts,.js}"], // Path to migrations
			// migrationsRun: true, // Automatically run migrations on startup
		};

		return postgresTypeOrmOptions;
	}
}
