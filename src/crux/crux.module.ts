import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CruxController as V1CruxController } from "./v1/controllers/crux.controller";

import { CruxService as V1CruxService } from "./v1/services/crux.service";

import { Crux, CruxSchema } from "./schema/crux.schema";

@Module({
	imports: [
		// * Main Repository
		MongooseModule.forFeature([{ name: Crux.name, schema: CruxSchema }]),
	],
	controllers: [
		// * Version 1 Controllers
		V1CruxController,
	],
	providers: [
		// * Version 1 Services
		V1CruxService,
	],
	exports: [
		// * Version 1 Services
		V1CruxService,
	],
})
export class CruxModule {}
