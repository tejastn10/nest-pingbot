import { InfoObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

const SwaggerOptions: InfoObject = {
	title: "Hearth",
	description: "Hearth's API descriptions & Services",
	version: "1.0.0",
	// termsOfService: "https://hearth.com/terms-of-service",
	// contact: {
	// 	name: "Hearth Team",
	// 	email: "contact@hearth.com",
	// 	url: "https://hearth.com/contact",
	// },
	license: {
		name: "MIT License",
		url: "https://opensource.org/licenses/MIT",
	},
};

export { SwaggerOptions };
