import type { Request } from "express";
import { Controller, Post, Delete, Param, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { JwtGuard } from "src/auth/jwt.guard";
import { RolesGuard } from "src/common/roles/roles.guard";
import { WorkspaceMemberGuard } from "src/common/roles/workspace-member.guard";
import { Roles } from "src/common/roles/roles.decorator";
import { Role } from "src/common/roles/roles.enum";
import { DocumentFavoriteService } from "./document-favorite.service";

@ApiTags("Document Favorites")
@UseGuards(JwtGuard, RolesGuard, WorkspaceMemberGuard)
@Roles(Role.USER)
@Throttle({ long: {} })
@Controller("workspace/:workspaceId/document")
export class DocumentFavoriteController {
    constructor(private readonly documentFavoriteService: DocumentFavoriteService) { }

    @ApiOperation({ summary: "Add Favorite", description: "Mark a document as favorite.", })
    @Post(":documentId/favorite")
    async addFavorite(@Param("workspaceId") workspaceId: string, @Param("documentId") documentId: string, @Req() req: Request,) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.documentFavoriteService.addFavorite(workspaceId, workspaceMemberId!, documentId);

        return { message: "Document added to favorites successfully.", data };
    }

    @ApiOperation({
        summary: "Remove Favorite",
        description: "Remove a document from favorites.",
    })
    @Delete(":documentId/favorite")
    async removeFavorite(
        @Param("workspaceId") workspaceId: string,
        @Param("documentId") documentId: string,
        @Req() req: Request,
    ) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.documentFavoriteService.removeFavorite(
            workspaceId,
            workspaceMemberId!,
            documentId,
        );

        return {
            message: "Document removed from favorites successfully.",
            data,
        };
    }
}