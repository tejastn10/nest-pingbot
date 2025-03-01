import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class ConfigService {
	constructor(private configService: NestConfigService) {}

	getString(key: string): string {
		return this.configService.get<string>(key);
	}

	getNumber(key: string): number {
		const value = this.configService.get<number>(key);
		const numberValue = Number(value);
		return isNaN(numberValue) ? 0 : numberValue;
	}

	getBoolean(key: string): boolean {
		return this.configService.get<string>(key) === "true";
	}

	getObject(key: string): Record<never, never> {
		return JSON.parse(this.configService.get<Record<never, never>>(key) as string);
	}
}
