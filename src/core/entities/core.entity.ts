import { ApiProperty } from "@nestjs/swagger";

import { CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsUUID, IsNotEmpty, IsDateString } from "class-validator";

@Entity()
class Core {
	@ApiProperty({
		example: "123e4567-e89b-12d3-a456-426614174000",
		description: "The UUID of the core.",
		format: "uuid",
	})
	@IsUUID()
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ApiProperty({
		example: "2025-06-20T12:00:00Z",
		description: "The date/time when the core was created.",
		format: "date-time",
	})
	@IsNotEmpty()
	@IsDateString()
	@CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt: Date;

	@ApiProperty({
		example: "2025-06-20T12:30:00Z",
		description: "The date/time when the core was last updated.",
		format: "date-time",
	})
	@IsNotEmpty()
	@IsDateString()
	@UpdateDateColumn({
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP",
		onUpdate: "CURRENT_TIMESTAMP",
	})
	updatedAt: Date;
}

export { Core };
