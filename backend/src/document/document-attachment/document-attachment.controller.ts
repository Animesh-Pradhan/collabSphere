import type { Request } from "express";
import { Controller, Post, Get, Delete, Param, Query, Req, UploadedFile, UseInterceptors, UseGuards, DefaultValuePipe, ParseIntPipe } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { JwtGuard } from "src/auth/jwt.guard";
import { RolesGuard } from "src/common/roles/roles.guard";
import { WorkspaceMemberGuard } from "src/common/roles/workspace-member.guard";
import { Roles } from "src/common/roles/roles.decorator";
import { Role } from "src/common/roles/roles.enum";
import { DocumentAttachmentService } from "./document-attachment.service";

@ApiTags("Document Attachments")
@UseGuards(JwtGuard, RolesGuard, WorkspaceMemberGuard)
@Roles(Role.USER)
@Throttle({ long: {} })
@Controller("workspace/:workspaceId/document/:documentId/attachments")

export class DocumentAttachmentController {
    constructor(private readonly documentAttachmentService: DocumentAttachmentService) { }

    @ApiOperation({ summary: "Upload Attachment", description: "Upload an attachment to a document." })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: { file: { type: "string", format: "binary" } },
            required: ["file"],
        },
    })
    @Post()
    @UseInterceptors(FileInterceptor("file"))
    async upload(@Param("workspaceId") workspaceId: string, @Param("documentId") documentId: string, @Req() req: Request, @UploadedFile() file: Express.Multer.File) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.documentAttachmentService.uploadAttachment(workspaceId, workspaceMemberId!, documentId, file);
        return { message: "Attachment uploaded successfully.", data };
    }

    @ApiOperation({ summary: "Get Attachments", description: "Retrieve all attachments of a document." })
    @Get()
    async findAll(@Param("workspaceId") workspaceId: string, @Param("documentId") documentId: string, @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number, @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number) {
        const data = await this.documentAttachmentService.getAttachments(workspaceId, documentId, page, limit);
        return { message: "Attachments fetched successfully.", data };
    }

    @ApiOperation({ summary: "Delete Attachment", description: "Soft delete an attachment from a document." })
    @Delete(":attachmentId")
    async remove(@Param("workspaceId") workspaceId: string, @Param("documentId") documentId: string, @Param("attachmentId") attachmentId: string, @Req() req: Request) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.documentAttachmentService.deleteAttachment(workspaceId, workspaceMemberId!, documentId, attachmentId);
        return { message: "Attachment deleted successfully.", data };
    }
}