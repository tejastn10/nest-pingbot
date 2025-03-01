import { MongooseModuleAsyncOptions } from "@nestjs/mongoose";

import { ConfigModule } from "../../config/config.module";

import { MongoDBService } from "./mongo-db.service";

const MongoOptions: MongooseModuleAsyncOptions = {
	imports: [ConfigModule],
	useClass: MongoDBService,
};

export { MongoOptions };
