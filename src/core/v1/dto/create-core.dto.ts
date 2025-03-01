import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

class CreateCoreRequestDto {}

class CreateCoreResponseDto {
	@ApiProperty({
		example: "1ec9cf4c-2a93-407b-9dfa-bc052f15132c",
		description: "The id of the core",
	})
	@IsNotEmpty()
	@IsUUID()
	id: string;
}

export { CreateCoreRequestDto, CreateCoreResponseDto };
