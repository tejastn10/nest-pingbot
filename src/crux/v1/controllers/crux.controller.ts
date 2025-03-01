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

import { CruxService } from "../services/crux.service";

import { CreateCruxRequestDto, CreateCruxResponseDto } from "../dto/create-crux.dto";
import { FindCruxResponseDto } from "../dto/find-crux.dto";
import { UpdateCruxRequestDto, UpdateCruxResponseDto } from "../dto/update-crux.dto";

import { ControllerOptions } from "./crux.controller.options";

import { ResponseMessage, ResponseStatus } from "../../../common/enum/response";

@ApiTags("Crux")
@Controller(ControllerOptions)
@UsePipes(new ValidationPipe({ transform: true }))
export class CruxController {
	constructor(private readonly cruxService: CruxService) {}

	private readonly logger = new Logger(CruxController.name);

	@Post()
	@ApiOperation({
		summary: "Create a new crux",
		description: "Creates a new crux with the provided details.",
	})
	@ApiResponse({
		status: ResponseStatus.CREATED,
		description: "Crux created successfully.",
		type: CreateCruxResponseDto,
	})
	@ApiResponse({
		status: ResponseStatus.BAD_REQUEST,
		description: "Crux creation failed.",
	})
	async create(@Body() createCruxRequestDto: CreateCruxRequestDto): Promise<CreateCruxResponseDto> {
		try {
			this.logger.log("Received request to create a new crux.");
			const crux = await this.cruxService.create(createCruxRequestDto);
			return crux;
		} catch (error) {
			this.logger.error(`An error occurred while creating up the crux: ${error.message}`);

			throw new HttpException(
				error.message ?? ResponseMessage.BAD_REQUEST,
				error.status ?? ResponseStatus.BAD_REQUEST
			);
		}
	}

	@Get(":id")
	@ApiOperation({
		summary: "Find crux by ID",
		description: "Finds a single crux by the provided ID.",
	})
	@ApiParam({
		name: "id",
		description: "The unique identifier of the crux.",
		type: "string",
	})
	@ApiResponse({
		status: ResponseStatus.OK,
		description: "Crux found successfully.",
		type: FindCruxResponseDto,
	})
	@ApiResponse({
		status: ResponseStatus.I_AM_A_TEAPOT,
		description: "Failed to find the crux due to an internal server error.",
	})
	async find(@Param("id", ParseUUIDPipe) id: string): Promise<FindCruxResponseDto> {
		try {
			this.logger.log("Attempting to find crux using the provided ID.");
			const crux = await this.cruxService.find(id);
			return crux;
		} catch (error) {
			this.logger.error(`An error occurred while finding the crux: ${error.message}`);

			throw new HttpException(
				error.message ?? ResponseMessage.BAD_REQUEST,
				error.status ?? ResponseStatus.BAD_REQUEST
			);
		}
	}

	@Patch(":id")
	@ApiOperation({
		summary: "Update crux information",
		description: "Updates a crux's information based on the provided data.",
	})
	@ApiParam({
		name: "id",
		description: "The unique identifier of the crux.",
		type: "string",
	})
	@ApiResponse({
		status: ResponseStatus.OK,
		description: "Crux updated successfully.",
		type: UpdateCruxResponseDto,
	})
	@ApiResponse({
		status: ResponseStatus.NOT_FOUND,
		description: "Crux not found.",
	})
	@ApiResponse({
		status: ResponseStatus.BAD_REQUEST,
		description: "Bad request, unable to process the update.",
	})
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateCruxRequestDto: UpdateCruxRequestDto
	): Promise<UpdateCruxResponseDto> {
		try {
			this.logger.log("Received request to update a crux.");
			const updatedCrux = await this.cruxService.update(id, updateCruxRequestDto);
			return updatedCrux;
		} catch (error) {
			this.logger.error(`An error occurred while updating the crux: ${error.message}`);

			throw new HttpException(
				error.message ?? ResponseMessage.BAD_REQUEST,
				error.status ?? ResponseStatus.BAD_REQUEST
			);
		}
	}

	@Delete(":id")
	@ApiOperation({
		summary: "Delete crux by ID",
		description: "Deletes a crux by their ID.",
	})
	@ApiParam({
		name: "id",
		description: "The unique identifier of the crux.",
		type: "string",
	})
	@ApiResponse({
		status: ResponseStatus.OK,
		description: "Crux deleted successfully.",
		type: String,
	})
	@ApiResponse({
		status: ResponseStatus.NOT_FOUND,
		description: "Crux not found.",
	})
	@ApiResponse({
		status: ResponseStatus.BAD_REQUEST,
		description: "Bad request, unable to delete the crux.",
	})
	async remove(@Param("id", ParseUUIDPipe) id: string): Promise<string> {
		try {
			this.logger.log("Received request to delete a crux.");
			const message = await this.cruxService.remove(id);
			return message;
		} catch (error) {
			this.logger.error(`An error occurred while deleting the crux: ${error.message}`);

			throw new HttpException(
				error.message ?? ResponseMessage.BAD_REQUEST,
				error.status ?? ResponseStatus.BAD_REQUEST
			);
		}
	}
}
