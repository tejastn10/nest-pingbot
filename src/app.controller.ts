import { Controller, Get, HttpException, Logger } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	HealthCheckService,
	HealthCheck,
	HealthCheckResult,
	MemoryHealthIndicator,
	DiskHealthIndicator,
	HealthIndicatorResult,
	TypeOrmHealthIndicator,
} from "@nestjs/terminus";

import { ResponseMessage, ResponseStatus } from "./common/enum/response";

@ApiTags("Health")
@Controller()
export class AppController {
	constructor(
		private health: HealthCheckService,
		private memory: MemoryHealthIndicator,
		private disk: DiskHealthIndicator,
		private database: TypeOrmHealthIndicator
	) {}

	private readonly logger = new Logger("Main");

	@Get()
	@ApiOperation({
		summary: "Check if server is running",
		description: "This endpoint is used to verify whether the server is currently running.",
	})
	main(): string {
		return "Server running";
	}

	@Get("health")
	@ApiOperation({
		summary: "Get server health status",
		description:
			"This endpoint retrieves the health status of the server, indicating whether it is operating normally or if there are any issues that need attention.",
	})
	@HealthCheck()
	async check(): Promise<HealthCheckResult> {
		try {
			const result = await this.health.check([
				async (): Promise<HealthIndicatorResult> =>
					this.memory.checkHeap("memory_heap", 150 * 1024 * 1024), // Check memory usage
				async (): Promise<HealthIndicatorResult> =>
					this.disk.checkStorage("disk_storage", { thresholdPercent: 0.5, path: "/" }), // Check disk usage
				async (): Promise<HealthIndicatorResult> =>
					this.database.pingCheck("database", { timeout: 300 }), // Check database connection
			]);

			// If any individual health check fails, throw an error
			Object.values(result.details).forEach((detail) => {
				if (detail.status !== "up") {
					throw new HttpException(
						ResponseMessage.SERVICE_UNAVAILABLE,
						ResponseStatus.SERVICE_UNAVAILABLE
					);
				}
			});

			return result;
		} catch (error) {
			this.logger.error(`An error occurred while checking health ${error.message}`);

			throw new HttpException(
				error.message === ResponseMessage.SERVICE_UNAVAILABLE
					? ResponseMessage.SERVICE_UNAVAILABLE
					: ResponseMessage.I_AM_A_TEAPOT,
				error.message === ResponseMessage.SERVICE_UNAVAILABLE
					? ResponseStatus.SERVICE_UNAVAILABLE
					: ResponseStatus.I_AM_A_TEAPOT
			);
		}
	}
}
