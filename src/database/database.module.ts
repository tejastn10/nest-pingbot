import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";

import { PostgresOptions } from "./postgres/postgres-db.options";
import { MongoOptions } from "./mongo/mongo-db.options";

import { ConfigModule } from "../config/config.module";

@Module({
	imports: [
		ConfigModule,

		TypeOrmModule.forRootAsync(PostgresOptions),

		MongooseModule.forRootAsync(MongoOptions),
	],
	controllers: [],
	providers: [],
	exports: [],
})
export class DatabaseModule {}
