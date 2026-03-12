import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsArray, IsObject } from 'class-validator';
import { TaskPriority, TaskStatus } from 'generated/prisma/enums';

export class CreateTaskDto {
    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    ownerId?: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    parentTaskId?: string;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsOptional()
    labels?: string[];

    @ApiPropertyOptional({ type: Object })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;

    @ApiPropertyOptional({ type: Object })
    @IsObject()
    @IsOptional()
    aiContext?: Record<string, any>;
}