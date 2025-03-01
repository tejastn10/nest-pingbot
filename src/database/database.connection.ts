import { Logger } from "@nestjs/common";

import { MongooseModuleFactoryOptions } from "@nestjs/mongoose";

import { DataSource, DataSourceOptions } from "typeorm";
import mongoose from "mongoose";

const initializeDatabaseConnection = async (
	options: DataSourceOptions | MongooseModuleFactoryOptions
): Promise<DataSource | typeof mongoose> => {
	const logger = new Logger("DatabaseService");

	if (options && "type" in options) {
		// PostgreSQL (TypeORM)
		const databaseType = options.type;
		const dataSource = await new DataSource(options as DataSourceOptions).initialize();
		const databaseName = databaseType.charAt(0).toUpperCase() + databaseType.slice(1);

		logger.debug(`Connecting to ${databaseName}...`);

		if (dataSource.isInitialized) {
			logger.verbose(`${databaseName} client is ready and connected.`);
		}

		return dataSource;
	} else if (options && "uri" in options) {
		// MongoDB (Mongoose)
		logger.debug("Connecting to MongoDB...");

		const { uri, ...mongooseOptions } = options as MongooseModuleFactoryOptions;
		const connection = await mongoose.connect(uri, mongooseOptions);

		logger.verbose("MongoDB client is ready and connected.");
		return connection;
	} else {
		throw new Error("Unknown database configuration options provided.");
	}
};

export { initializeDatabaseConnection };
