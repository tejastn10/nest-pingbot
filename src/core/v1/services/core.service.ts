import {
	Injectable,
	Logger,
	NotFoundException,
	ConflictException,
	BadRequestException,
	ImATeapotException,
	NotAcceptableException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { FindManyOptions, Repository } from "typeorm";
import { ValidationError } from "class-validator";

import { Core } from "../../entities/core.entity";

import { CreateCoreRequestDto, CreateCoreResponseDto } from "../dto/create-core.dto";
import { FindCoreResponseDto } from "../dto/find-core.dto";
import { UpdateCoreRequestDto, UpdateCoreResponseDto } from "../dto/update-core.dto";

import { ResponseMessage } from "../../../common/enum/response";

@Injectable()
export class CoreService {
	constructor(
		@InjectRepository(Core)
		private coreRepository: Repository<Core>
	) {}

	private readonly logger = new Logger(CoreService.name);

	async create(createCoreDto: CreateCoreRequestDto): Promise<CreateCoreResponseDto> {
		try {
			this.logger.log("Attempting to create a core");
			const core = this.coreRepository.create(createCoreDto);
			const savedCore = await this.coreRepository.save(core);

			this.logger.log(`Core creation successful for ID: ${savedCore.id}`);

			this.logger.log("Transforming core to the desired response format...");
			const transformedCore: CreateCoreResponseDto = {
				id: savedCore.id,
			};
			this.logger.log("Core transformed & returned!");

			return transformedCore;
		} catch (error) {
			this.logger.error(`Failed to create core: ${error.message}`);

			if (error.code === "23505" || error.message.includes("duplicate key value")) {
				throw new ConflictException(`${ResponseMessage.CONFLICT}: Duplicate key error`);
			} else if (error instanceof ValidationError) {
				throw new BadRequestException(`${ResponseMessage.BAD_REQUEST}: Validation failed`);
			}

			throw new ImATeapotException(ResponseMessage.I_AM_A_TEAPOT);
		}
	}

	async find(id: string): Promise<FindCoreResponseDto> {
		try {
			this.logger.log(`Attempting to find core by ID: ${id}`);
			const core = await this.coreRepository.findOne({ where: { id } });

			if (!core) {
				this.logger.warn(`Core with ID: ${id} not found`);
				throw new NotFoundException(`${ResponseMessage.NOT_FOUND}: Core not found`);
			}

			this.logger.log(`Core with ID: ${id} found`);

			this.logger.log("Transforming core to the desired response format...");
			const transformedCore: CreateCoreResponseDto = {
				id: core.id,
			};
			this.logger.log("Core transformed & returned!");

			return transformedCore;
		} catch (error) {
			this.logger.error(`Failed to find core: ${error.message}`);

			if (error instanceof NotFoundException) {
				throw error;
			}

			throw new ImATeapotException(ResponseMessage.I_AM_A_TEAPOT);
		}
	}

	async update(
		id: string,
		updateCoreRequestDto: UpdateCoreRequestDto
	): Promise<UpdateCoreResponseDto> {
		try {
			this.logger.log(`Attempting to update core with ID: ${id}`);
			const core = await this.coreRepository.findOne({ where: { id } });

			if (!core) {
				this.logger.warn(`Core with ID: ${id} not found`);
				throw new NotFoundException(`${ResponseMessage.NOT_FOUND}: Core not found`);
			}

			const updatedCore = await this.coreRepository.save({
				...core,
				...updateCoreRequestDto,
			});

			this.logger.log("Core updated successfully");

			this.logger.log("Transforming core to the desired response format...");
			const transformedCore: UpdateCoreResponseDto = {
				id: updatedCore.id,
			};
			this.logger.log("Core transformed & returned!");

			return transformedCore;
		} catch (error) {
			this.logger.error(`Failed to update core: ${error.message}`);

			if (error instanceof NotFoundException || error instanceof NotAcceptableException) {
				throw error;
			}

			throw new ImATeapotException(ResponseMessage.I_AM_A_TEAPOT);
		}
	}

	async remove(id: string): Promise<string> {
		try {
			this.logger.log(`Attempting to delete core with ID: ${id}`);
			const core = await this.coreRepository.findOne({ where: { id } });

			if (!core) {
				this.logger.warn(`Core with ID: ${id} not found`);
				throw new NotFoundException(`${ResponseMessage.NOT_FOUND}: Core not found`);
			}

			await this.coreRepository.remove(core);
			this.logger.log(`Core with ID: ${id} deleted successfully`);

			return "Core deleted successfully";
		} catch (error) {
			this.logger.error(`Failed to remove core: ${error.message}`);

			if (error instanceof NotFoundException) {
				throw error;
			}

			throw new ImATeapotException(ResponseMessage.I_AM_A_TEAPOT);
		}
	}

	// ? Retrieves a core or cores by query and returns the Core entity or array of entities.
	async findByQuery(query: FindManyOptions<Core>): Promise<Core | Core[]> {
		try {
			this.logger.log("Attempting to find core/cores");

			const cores = await this.coreRepository.find(query);

			if (cores.length === 0) {
				this.logger.warn("Core/Core not found");
				throw new NotFoundException(`${ResponseMessage.NOT_FOUND}: Core/Core not found`);
			}

			this.logger.log("Core/Core found");

			// Return a single core if only one core is found, otherwise return the array of cores
			return cores.length === 1 ? cores[0] : cores;
		} catch (error) {
			this.logger.error(`Failed to find core/cores: ${error.message}`);

			if (error instanceof NotFoundException) {
				throw error;
			}

			throw new ImATeapotException(ResponseMessage.I_AM_A_TEAPOT);
		}
	}
}
