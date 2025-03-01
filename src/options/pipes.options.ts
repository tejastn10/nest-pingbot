import { ValidationPipeOptions } from "@nestjs/common";

const ValidationPipeOptions: ValidationPipeOptions = {
	whitelist: true,
	transform: true,
	stopAtFirstError: true,
	errorHttpStatusCode: 422,
	forbidNonWhitelisted: true,
	transformOptions: {
		enableImplicitConversion: true,
		exposeUnsetFields: true,
	},
};

export { ValidationPipeOptions };
