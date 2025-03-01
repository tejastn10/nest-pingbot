import { FastifyHelmetOptions } from "@fastify/helmet";

const HelmetOptions: FastifyHelmetOptions = {
	referrerPolicy: { policy: "strict-origin-when-cross-origin" },
	ieNoOpen: true,
	noSniff: true,
	hidePoweredBy: true,
	permittedCrossDomainPolicies: { permittedPolicies: "none" },
	xssFilter: true,
};

export { HelmetOptions };
