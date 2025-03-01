import { Module } from "@nestjs/common";

import { SwaggerService } from "./swagger.service";

@Module({
	imports: [],
	controllers: [],
	providers: [SwaggerService],
	exports: [SwaggerService],
})
export class SwaggerModule {}
