import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";

import { PostgresDBService } from "./postgres-db.service";

import { ConfigModule } from "../../config/config.module";

const PostgresOptions: TypeOrmModuleAsyncOptions = {
	imports: [ConfigModule],
	useClass: PostgresDBService,
};

export { PostgresOptions };
