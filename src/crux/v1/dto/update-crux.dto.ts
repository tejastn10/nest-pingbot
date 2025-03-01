import { PartialType } from "@nestjs/swagger";

import { CreateCruxRequestDto, CreateCruxResponseDto } from "./create-crux.dto";

class UpdateCruxRequestDto extends PartialType(CreateCruxRequestDto) {}

class UpdateCruxResponseDto extends CreateCruxResponseDto {}

export { UpdateCruxRequestDto, UpdateCruxResponseDto };
