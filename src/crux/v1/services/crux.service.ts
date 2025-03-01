import {
	Injectable,
	Logger,
	NotFoundException,
	ConflictException,
	BadRequestException,
	ImATeapotException,
	NotAcceptableException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Model } from "mongoose";
import { ValidationError } from "class-validator";

import { Crux, CruxDocument } from "../../schema/crux.schema";

import { CreateCruxRequestDto, CreateCruxResponseDto } from "../dto/create-crux.dto";
import { FindCruxResponseDto } from "../dto/find-crux.dto";
import { UpdateCruxRequestDto, UpdateCruxResponseDto } from "../dto/update-crux.dto";

import { ResponseMessage } from "../../../common/enum/response";

@Injectable()
export class CruxService {
	constructor(
		@InjectModel(Crux.name)
		private cruxModel: Model<CruxDocument>
	) {}

	private readonly logger = new Logger(CruxService.name);

	async create(createCruxDto: CreateCruxRequestDto): Promise<CreateCruxResponseDto> {
		try {
			this.logger.log("Attempting to create a crux");
			const crux = new this.cruxModel(createCruxDto);
			const savedCrux = await crux.save();

			this.logger.log(`Crux creation successful for ID: ${savedCrux._id}`);

			this.logger.log("Transforming crux to the desired response format...");
			const transformedCrux: CreateCruxResponseDto = {
				id: savedCrux._id as string,
			};
			this.logger.log("Crux transformed & returned!");

			return transformedCrux;
		} catch (error) {
			this.logger.error(`Failed to create crux: ${error.message}`);

			if (error.code === 11000) {
				throw new ConflictException(`${ResponseMessage.CONFLICT}: Duplicate key error`);
			} else if (error instanceof ValidationError) {
				throw new BadRequestException(`${ResponseMessage.BAD_REQUEST}: Validation failed`);
			}

			throw new ImATeapotException(ResponseMessage.I_AM_A_TEAPOT);
		}
	}

	async find(id: string): Promise<FindCruxResponseDto> {
		try {
			this.logger.log(`Attempting to find crux by ID: ${id}`);
			const crux = await this.cruxModel.findById(id).exec();

			if (!crux) {
				this.logger.warn(`Crux with ID: ${id} not found`);
				throw new NotFoundException(`${ResponseMessage.NOT_FOUND}: Crux not found`);
			}

			this.logger.log(`Crux with ID: ${id} found`);

			this.logger.log("Transforming crux to the desired response format...");
			const transformedCrux: CreateCruxResponseDto = {
				id: crux._id as string,
			};

			return transformedCrux;
		} catch (error) {
			this.logger.error(`Failed to find crux: ${error.message}`);

			if (error instanceof NotFoundException) {
				throw error;
			}

			throw new ImATeapotException(ResponseMessage.I_AM_A_TEAPOT);
		}
	}

	async update(
		id: string,
		updateCruxRequestDto: UpdateCruxRequestDto
	): Promise<UpdateCruxResponseDto> {
		try {
			this.logger.log(`Attempting to update crux with ID: ${id}`);
			const crux = await this.cruxModel.findById(id).exec();

			if (!crux) {
				this.logger.warn(`Crux with ID: ${id} not found`);
				throw new NotFoundException(`${ResponseMessage.NOT_FOUND}: Crux not found`);
			}

			// Update the document fields manually
			const updatedCrux = await this.cruxModel
				.findByIdAndUpdate(id, { ...updateCruxRequestDto }, { new: true })
				.exec();

			this.logger.log("Crux updated successfully");

			this.logger.log("Transforming crux to the desired response format...");
			const transformedCrux: UpdateCruxResponseDto = {
				id: updatedCrux._id as string,
			};
			this.logger.log("Crux transformed & returned!");

			return transformedCrux;
		} catch (error) {
			this.logger.error(`Failed to update crux: ${error.message}`);

			if (error instanceof NotFoundException || error instanceof NotAcceptableException) {
				throw error;
			}

			throw new ImATeapotException(ResponseMessage.I_AM_A_TEAPOT);
		}
	}

	async remove(id: string): Promise<string> {
		try {
			this.logger.log(`Attempting to delete crux with ID: ${id}`);
			const crux = await this.cruxModel.findById(id).exec();

			if (!crux) {
				this.logger.warn(`Crux with ID: ${id} not found`);
				throw new NotFoundException(`${ResponseMessage.NOT_FOUND}: Crux not found`);
			}

			await crux.deleteOne();
			this.logger.log(`Crux with ID: ${id} deleted successfully`);

			return "Crux deleted successfully";
		} catch (error) {
			this.logger.error(`Failed to remove crux: ${error.message}`);

			if (error instanceof NotFoundException) {
				throw error;
			}

			throw new ImATeapotException(ResponseMessage.I_AM_A_TEAPOT);
		}
	}

	// ? Retrieves a crux or cruxs by a query and return the Crux model or an array of models
	async findByQuery(query: object): Promise<Crux | Crux[]> {
		try {
			this.logger.log("Attempting to find crux/cruxes");

			const cruxes = await this.cruxModel.find(query).exec();

			if (cruxes.length === 0) {
				this.logger.warn("Crux/Cruxes not found");
				throw new NotFoundException(`${ResponseMessage.NOT_FOUND}: Crux/Cruxes not found`);
			}

			this.logger.log("Crux/Cruxes found");

			return cruxes.length === 1 ? cruxes[0] : cruxes;
		} catch (error) {
			this.logger.error(`Failed to find crux/cruxes: ${error.message}`);

			if (error instanceof NotFoundException) {
				throw error;
			}

			throw new ImATeapotException(ResponseMessage.I_AM_A_TEAPOT);
		}
	}
}
