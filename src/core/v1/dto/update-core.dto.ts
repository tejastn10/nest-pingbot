import { PartialType } from "@nestjs/swagger";

import { CreateCoreRequestDto, CreateCoreResponseDto } from "./create-core.dto";

class UpdateCoreRequestDto extends PartialType(CreateCoreRequestDto) {}

class UpdateCoreResponseDto extends CreateCoreResponseDto {}

export { UpdateCoreRequestDto, UpdateCoreResponseDto };
