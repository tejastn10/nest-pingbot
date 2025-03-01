import { VersioningType, type VersioningOptions } from "@nestjs/common";

const VersioningOptions: VersioningOptions = {
	type: VersioningType.URI,
	prefix: "api/v",
};

export { VersioningOptions };
