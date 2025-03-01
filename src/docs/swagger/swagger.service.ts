import { Injectable } from "@nestjs/common";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import {
	DocumentBuilder,
	SwaggerCustomOptions,
	SwaggerDocumentOptions,
	SwaggerModule,
} from "@nestjs/swagger";

import { moduleTags } from "./swagger.tags";

import { SwaggerDocumentBuilderOptions } from "./types";

@Injectable()
export class SwaggerService {
	constructor() {}

	createDocument(app: NestFastifyApplication, builderOptions: SwaggerDocumentBuilderOptions): void {
		const documentBuilder = new DocumentBuilder()
			.setTitle(builderOptions.title || "API Documentation")
			.setDescription(builderOptions.description || "API description")
			.setVersion(builderOptions.version || "1.0.0")
			.setTermsOfService(builderOptions.termsOfService)
			.setLicense(builderOptions.license?.name, builderOptions.license?.url)
			.setContact(
				builderOptions.contact?.name,
				builderOptions.contact?.url,
				builderOptions.contact?.email
			);

		// Tags for Module Separation
		moduleTags.forEach((tag) => {
			const { name, description } = tag;
			documentBuilder.addTag(name, description);
		});

		const config = documentBuilder.build();

		const documentOptions: SwaggerDocumentOptions = {
			// Specify additional Swagger options here
			operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey, // Custom operationId factory function
		};
		const document = SwaggerModule.createDocument(app, config, documentOptions);

		const moduleOptions: SwaggerCustomOptions = {
			customSiteTitle: "Hearth API Documentation",
			// customfavIcon: "../../../assets/svg/hearth.svg",
		};
		SwaggerModule.setup("docs", app, document, moduleOptions);
	}
}
