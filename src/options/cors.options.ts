import { type CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

const CorsOptions: CorsOptions = {
	origin: [
		// ? Development environment
		"http://localhost:3000",
		//  * Add Production and Staging URLs
	],
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	allowedHeaders: "Content-Type, Authorization",
	credentials: true,
	maxAge: 86400,
};

export { CorsOptions };
