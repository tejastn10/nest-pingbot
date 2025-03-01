import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseUUIDPipe,
	ValidationPipe,
	UsePipes,
	HttpException,
	Logger,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CoreService } from "../services/core.service";

import { CreateCoreRequestDto, CreateCoreResponseDto } from "../dto/create-core.dto";
import { FindCoreResponseDto } from "../dto/find-core.dto";
import { UpdateCoreRequestDto, UpdateCoreResponseDto } from "../dto/update-core.dto";

import { ControllerOptions } from "./core.controller.options";

import { ResponseMessage, ResponseStatus } from "../../../common/enum/response";

@ApiTags("Core")
@Controller(ControllerOptions)
@UsePipes(new ValidationPipe({ transform: true }))
export class CoreController {
	constructor(private readonly coreService: CoreService) {}

	private readonly logger = new Logger(CoreController.name);

	@Post()
	@ApiOperation({
		summary: "Create a new core",
		description: "Creates a new core with the provided details.",
	})
	@ApiResponse({
		status: ResponseStatus.CREATED,
		description: "Core created successfully.",
		type: CreateCoreResponseDto,
	})
	@ApiResponse({
		status: ResponseStatus.BAD_REQUEST,
		description: "Core creation failed.",
	})
	async create(@Body() createCoreRequestDto: CreateCoreRequestDto): Promise<CreateCoreResponseDto> {
		try {
			this.logger.log("Received request to create a new core.");
			const core = await this.coreService.create(createCoreRequestDto);
			return core;
		} catch (error) {
			this.logger.error(`An error occurred while creating up the core: ${error.message}`);

			throw new HttpException(
				error.message ?? ResponseMessage.BAD_REQUEST,
				error.status ?? ResponseStatus.BAD_REQUEST
			);
		}
	}

	@Get(":id")
	@ApiOperation({
		summary: "Find core by ID",
		description: "Finds a single core by the provided ID.",
	})
	@ApiParam({
		name: "id",
		description: "The unique identifier of the core.",
		type: "string",
	})
	@ApiResponse({
		status: ResponseStatus.OK,
		description: "Core found successfully.",
		type: FindCoreResponseDto,
	})
	@ApiResponse({
		status: ResponseStatus.I_AM_A_TEAPOT,
		description: "Failed to find the core due to an internal server error.",
	})
	async find(@Param("id", ParseUUIDPipe) id: string): Promise<FindCoreResponseDto> {
		try {
			this.logger.log("Attempting to find core using the provided ID.");
			const core = await this.coreService.find(id);
			return core;
		} catch (error) {
			this.logger.error(`An error occurred while finding the core: ${error.message}`);

			throw new HttpException(
				error.message ?? ResponseMessage.BAD_REQUEST,
				error.status ?? ResponseStatus.BAD_REQUEST
			);
		}
	}

	@Patch(":id")
	@ApiOperation({
		summary: "Update core information",
		description: "Updates a core's information based on the provided data.",
	})
	@ApiParam({
		name: "id",
		description: "The unique identifier of the core.",
		type: "string",
	})
	@ApiResponse({
		status: ResponseStatus.OK,
		description: "Core updated successfully.",
		type: UpdateCoreResponseDto,
	})
	@ApiResponse({
		status: ResponseStatus.NOT_FOUND,
		description: "Core not found.",
	})
	@ApiResponse({
		status: ResponseStatus.BAD_REQUEST,
		description: "Bad request, unable to process the update.",
	})
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateCoreRequestDto: UpdateCoreRequestDto
	): Promise<UpdateCoreResponseDto> {
		try {
			this.logger.log("Received request to update a core.");
			const updatedCore = await this.coreService.update(id, updateCoreRequestDto);
			return updatedCore;
		} catch (error) {
			this.logger.error(`An error occurred while updating the core: ${error.message}`);

			throw new HttpException(
				error.message ?? ResponseMessage.BAD_REQUEST,
				error.status ?? ResponseStatus.BAD_REQUEST
			);
		}
	}

	@Delete(":id")
	@ApiOperation({
		summary: "Delete core by ID",
		description: "Deletes a core by their ID.",
	})
	@ApiParam({
		name: "id",
		description: "The unique identifier of the core.",
		type: "string",
	})
	@ApiResponse({
		status: ResponseStatus.OK,
		description: "Core deleted successfully.",
		type: String,
	})
	@ApiResponse({
		status: ResponseStatus.NOT_FOUND,
		description: "Core not found.",
	})
	@ApiResponse({
		status: ResponseStatus.BAD_REQUEST,
		description: "Bad request, unable to delete the core.",
	})
	async remove(@Param("id", ParseUUIDPipe) id: string): Promise<string> {
		try {
			this.logger.log("Received request to delete a core.");
			const message = await this.coreService.remove(id);
			return message;
		} catch (error) {
			this.logger.error(`An error occurred while deleting the core: ${error.message}`);

			throw new HttpException(
				error.message ?? ResponseMessage.BAD_REQUEST,
				error.status ?? ResponseStatus.BAD_REQUEST
			);
		}
	}
}
