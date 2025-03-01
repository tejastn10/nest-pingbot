import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CoreController as V1CoreController } from "./v1/controllers/core.controller";

import { CoreService as V1CoreService } from "./v1/services/core.service";

import { Core } from "./entities/core.entity";

@Module({
	imports: [
		// * Main Repository
		TypeOrmModule.forFeature([Core]),
	],
	controllers: [
		// * Version 1 Controllers
		V1CoreController,
	],
	providers: [
		// * Version 1 Services
		V1CoreService,
	],
	exports: [
		// * Version 1 Services
		V1CoreService,
	],
})
export class CoreModule {}
