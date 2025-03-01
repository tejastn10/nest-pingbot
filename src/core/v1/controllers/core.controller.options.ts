import { ControllerOptions } from "@nestjs/common";

const ControllerOptions: ControllerOptions = {
	path: "core",
	version: "1",

	// The following are the default options
	host: undefined,
	scope: undefined,
	durable: undefined,
};

export { ControllerOptions };
