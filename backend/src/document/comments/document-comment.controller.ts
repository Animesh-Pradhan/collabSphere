import type { Request } from 'express';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { JwtGuard } from "src/auth/jwt.guard";
import { Roles } from "src/common/roles/roles.decorator";
import { Role } from 'src/common/roles/roles.enum';
import { RolesGuard } from "src/common/roles/roles.guard";
import { WorkspaceMemberGuard } from "src/common/roles/workspace-member.guard";
import { DocumentCommentService } from "./document-comment.service";
import { CreateDocumentCommentDto } from './dto/create-document-comment.dto';
import { GetDocumentCommentsQueryDto } from './dto/other-helper.dto';


@ApiTags("Documents | Comments - (Workspace)")
@UseGuards(JwtGuard, RolesGuard, WorkspaceMemberGuard)
@Roles(Role.USER)
@Throttle({ long: {} })
@Controller('workspace/:workspaceId/document/:documentId/comments')
export class DocumentCommentController {
    constructor(private readonly documentCommentService: DocumentCommentService) { }

    @ApiOperation({ summary: "Add Document Comment", description: "Creates a new comment for a document inside a workspace.", })
    @Post()
    async create(@Param('workspaceId') workspaceId: string, @Param('documentId') documentId: string, @Req() req: Request, @Body() createCommentDto: CreateDocumentCommentDto) {
        const workspaceMemberId = req.workspaceMember?.id as string;
        const data = await this.documentCommentService.createComment(workspaceId, workspaceMemberId, documentId, createCommentDto);
        return { message: "A document comment added successfully.", data };
    }

    @ApiOperation({ summary: "Get Document Comments", description: "Retrieve all comments for a document including replies." })
    @ApiQuery({ name: "page", required: false, example: 1 })
    @ApiQuery({ name: "limit", required: false, example: 20 })
    @Get()
    async findAll(@Param("workspaceId") workspaceId: string, @Param("documentId") documentId: string, @Query() query: GetDocumentCommentsQueryDto) {
        const data = await this.documentCommentService.getComments(workspaceId, documentId, query);
        return { message: "Document comments retrieved successfully.", data };
    }

    @ApiOperation({ summary: "Resolve Comment Thread", description: "Marks a root comment thread as resolved." })
    @Patch(":commentId/resolve")
    async resolve(
        @Param("workspaceId") workspaceId: string,
        @Param("documentId") documentId: string,
        @Param("commentId") commentId: string,
        @Req() req: Request
    ) {
        const workspaceMemberId = req.workspaceMember?.id as string;
        const data = await this.documentCommentService.resolveComment(workspaceId, workspaceMemberId, documentId, commentId);
        return { message: "Comment resolved successfully.", data };
    }

    @ApiOperation({ summary: "Delete Comment", description: "Soft delete a document comment." })
    @Delete(":commentId")
    async delete(
        @Param("workspaceId") workspaceId: string,
        @Param("documentId") documentId: string,
        @Param("commentId") commentId: string,
        @Req() req: Request
    ) {
        const workspaceMemberId = req.workspaceMember?.id as string;
        const data = await this.documentCommentService.deleteComment(workspaceId, workspaceMemberId, documentId, commentId);
        return { message: "Comment deleted successfully.", data };
    }
}
