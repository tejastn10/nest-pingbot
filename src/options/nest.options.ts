import { Logger, NestApplicationOptions } from "@nestjs/common";

const NestOptions: NestApplicationOptions = {
	logger: new Logger(),
};

export { NestOptions };
