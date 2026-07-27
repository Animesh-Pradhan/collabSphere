import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { DocumentStatus } from "generated/prisma/enums";

class DocumentMemberUserDto {

    @Expose()
    @ApiProperty()
    id!: string;

    @Expose()
    @ApiProperty()
    firstName!: string;

    @Expose()
    @ApiProperty()
    lastName!: string;

    @Expose()
    @ApiProperty({ required: false })
    email?: string;

    @Expose()
    @ApiProperty({ required: false })
    avatar?: string;
}
export class DocumentMemberDto {

    @Expose()
    @ApiProperty()
    id!: string;

    @Expose()
    @ApiProperty()
    role!: string;

    @Expose()
    @Type(() => DocumentMemberUserDto)
    @ApiProperty({ type: DocumentMemberUserDto })
    user!: DocumentMemberUserDto;
}

class DocumentCountDto {
    @Expose()
    @ApiProperty()
    documentComments!: number;

    @Expose()
    @ApiProperty()
    documentVersions!: number;
}

export class DocumentListItemDto {

    @Expose()
    @ApiProperty()
    id!: string;

    @Expose()
    @ApiProperty()
    workspaceId!: string;

    @Expose()
    @ApiProperty()
    title!: string;

    @Expose()
    @ApiProperty({ required: false })
    description?: string;

    @Expose()
    @ApiProperty({ enum: DocumentStatus })
    status!: DocumentStatus;

    @Expose()
    @ApiProperty()
    currentVersion!: number;

    @Expose()
    @ApiProperty({ required: false })
    lockedBy?: string;

    @Expose()
    @ApiProperty({ required: false })
    lockedAt?: Date;

    @Expose()
    @ApiProperty()
    createdBy!: string;

    @Expose()
    @ApiProperty({ required: false })
    updatedBy?: string;

    @Expose()
    @ApiProperty({ required: false })
    publishedAt?: Date;

    @Expose()
    @ApiProperty({ required: false })
    metadata?: Record<string, any>;

    @Expose()
    @ApiProperty()
    createdAt!: Date;

    @Expose()
    @ApiProperty()
    updatedAt!: Date;

    @Expose()
    @Type(() => DocumentMemberDto)
    createdMember?: DocumentMemberDto;

    @Expose()
    @Type(() => DocumentMemberDto)
    updatedMember?: DocumentMemberDto;

    @Expose()
    @Type(() => DocumentMemberDto)
    lockedMember?: DocumentMemberDto;

    @Expose()
    @Transform(({ obj }) => (obj.documentFavorites ?? []).length > 0)
    isFavorite!: boolean;

    @Expose()
    @Type(() => DocumentCountDto)
    _count?: DocumentCountDto;
}