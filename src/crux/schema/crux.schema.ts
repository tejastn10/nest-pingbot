import { ApiProperty } from "@nestjs/swagger";

import { Document, HydratedDocument } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty, IsDateString } from "class-validator";

import { v4 } from "uuid";

@Schema({ timestamps: true })
class Crux extends Document {
	@ApiProperty({
		example: "67acac20ba6f24776bc0b65d",
		description: "The UUID of the document.",
	})
	@Prop({ type: String, default: v4 })
	_id: string;

	@ApiProperty({
		example: "2025-06-20T12:00:00Z",
		description: "The date/time when the document was created.",
		format: "date-time",
	})
	@IsNotEmpty()
	@IsDateString()
	@Prop()
	createdAt: Date;

	@ApiProperty({
		example: "2025-06-20T12:30:00Z",
		description: "The date/time when the document was last updated.",
		format: "date-time",
	})
	@IsNotEmpty()
	@IsDateString()
	@Prop()
	updatedAt: Date;
}

const CruxSchema = SchemaFactory.createForClass(Crux);
type CruxDocument = HydratedDocument<Crux>;

export { Crux, CruxSchema, CruxDocument };
