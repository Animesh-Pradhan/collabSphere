import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateOrganisationDto {
    @ApiProperty({ example: "Acme Corporation", description: "Organisation name" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: "acme", description: "Unique organisation slug (used in URL)" })
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty({ example: "Bangalore, Karnataka", description: "Organisation address" })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ example: "India", description: "Organisation country" })
    @IsString()
    @IsNotEmpty()
    country: string;

    @ApiProperty({ type: "string", format: "binary", description: "Organisation logo (image)", required: false })
    logo?: any;
}
