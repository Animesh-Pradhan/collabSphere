import { ApiProperty } from "@nestjs/swagger";
import { DocumentStatus } from "generated/prisma/enums";

export class DocumentListItemDto {

    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ enum: DocumentStatus })
    status: DocumentStatus;

    @ApiProperty()
    currentVersion: number;

    @ApiProperty({ required: false })
    lockedBy?: string;

    @ApiProperty({ required: false })
    lockedAt?: Date;

    @ApiProperty({ required: false })
    createdBy?: string;

    @ApiProperty({ required: false })
    publishedAt?: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
