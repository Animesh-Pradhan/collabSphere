import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateOrganisationDto {
    @ApiPropertyOptional({
        example: "Acme Corporation Pvt Ltd",
        description: "Organisation name",
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        example: "Bangalore, Karnataka",
        description: "Organisation address",
    })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({
        example: "India",
        description: "Organisation country",
    })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiPropertyOptional({ type: "string", format: "binary", description: "Organisation logo (image)", required: false })
    logo?: any;
}
