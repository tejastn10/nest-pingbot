import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

class CreateCruxRequestDto {}

class CreateCruxResponseDto {
	@ApiProperty({
		example: "67acac20ba6f24776bc0b65d",
		description: "The id of the crux",
	})
	@IsNotEmpty()
	@IsString()
	id: string;
}

export { CreateCruxRequestDto, CreateCruxResponseDto };
