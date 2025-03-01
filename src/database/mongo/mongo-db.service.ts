import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MongooseModuleOptions, MongooseOptionsFactory } from "@nestjs/mongoose";

import { ConfigService } from "../../config/config.service";
import { initializeDatabaseConnection } from "../database.connection";

@Injectable()
export class MongoDBService implements MongooseOptionsFactory, OnModuleInit {
	constructor(private readonly configService: ConfigService) {}

	private readonly logger = new Logger(MongoDBService.name);

	async onModuleInit(): Promise<void> {
		const options = this.createMongooseOptions();
		await initializeDatabaseConnection(options);
	}

	createMongooseOptions(): MongooseModuleOptions {
		const uri = this.configService.getString("MONGO_URL");
		const dbName = this.configService.getString("MONGO_DATABASE");
		const autoIndex = this.configService.getBoolean("MONGO_AUTO_INDEX") ?? false;
		const serverSelectionTimeoutMS = this.configService.getNumber("MONGO_TIMEOUT") || 5000; // Timeout in ms
		const socketTimeoutMS = this.configService.getNumber("MONGO_SOCKET_TIMEOUT") || 45000; // Timeout in ms

		if (!uri) {
			this.logger.error("MongoDB URL is not defined in environment variables.");
			throw new Error("MONGO_URL is required to establish a MongoDB connection.");
		}

		return {
			uri,
			dbName,
			autoIndex,
			serverSelectionTimeoutMS,
			socketTimeoutMS,
		};
	}
}
