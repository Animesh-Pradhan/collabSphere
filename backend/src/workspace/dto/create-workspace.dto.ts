import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateWorkspaceDto {
    @ApiProperty({ example: "Tech team", description: "Workspace Name", required: true })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: "Tech team - responsible for development", description: "Workspace description" })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: "false", description: "Make it as default workspace?" })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
