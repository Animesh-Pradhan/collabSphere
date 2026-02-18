import type { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { Roles } from 'src/common/roles/roles.decorator';
import { Role } from 'src/common/roles/roles.enum';
import { Throttle } from '@nestjs/throttler';
import { WorkspaceMemberGuard } from 'src/common/roles/workspace-member.guard';
import { plainToInstance } from 'class-transformer';
import { DocumentListItemDto } from './dto/document-list-response.dto';


@ApiTags("Documents - (Workspace)")
@UseGuards(JwtGuard, RolesGuard, WorkspaceMemberGuard)
@Roles(Role.USER)
@Throttle({ long: {} })
@Controller('workspace/:workspaceId/document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @ApiOperation({ summary: "Create Document", description: "Creates a new document inside a workspace and initializes version 1.", })
  @Post()
  async create(@Param('workspaceId') workspaceId: string, @Req() req: Request, @Body() createDocumentDto: CreateDocumentDto) {
    const workspaceMemberId = req.workspaceMember?.id;

    const data = await this.documentService.create(workspaceId, workspaceMemberId!, createDocumentDto);
    return { message: "A document added succesfully.", data };
  }

  @ApiOperation({ summary: "Get All Documents in Workspace" })
  @Get()
  async findAll(@Param('workspaceId') workspaceId: string) {
    const documents = await this.documentService.findAll(workspaceId);
    const data = plainToInstance(DocumentListItemDto, documents, { excludeExtraneousValues: true });
    return { message: "Documents fetched successfully.", data };
  }


  @ApiOperation({ summary: "Get Single Document", description: "Returns document metadata and its current version content." })
  @Get(':documentId')
  async findOne(@Param("workspaceId") workspaceId: string, @Param('documentId') documentId: string) {
    const data = await this.documentService.findOne(workspaceId, documentId)
    return { message: "Document details fetched successfully.", data };
  }

  @ApiOperation({ summary: "Update Document", description: "Creates a new document version and updates metadata." })
  @Patch(':documentId')
  async update(@Param('workspaceId') workspaceId: string, @Param('documentId') documentId: string, @Req() req: Request, @Body() updateDocumentDto: UpdateDocumentDto) {
    const workspaceMemberId = req.workspaceMember?.id;
    const data = await this.documentService.update(workspaceId, workspaceMemberId!, documentId, updateDocumentDto);
    return { message: "Document updated successfully.", data };
  }

  @ApiOperation({ summary: "Delete Document" })
  @Delete(':documentId')
  async remove(@Param('workspaceId') workspaceId: string, @Param('documentId') documentId: string, @Req() req: Request) {
    const workspaceMemberId = req.workspaceMember?.id;
    const data = await this.documentService.remove(workspaceId, workspaceMemberId!, documentId);
    return { message: "Document deleted successfully.", data };
  }

  @ApiOperation({ summary: "Lock Document" })
  @Post(':documentId/lock')
  async lock(@Param('workspaceId') workspaceId: string, @Param('documentId') documentId: string, @Req() req: Request) {
    const workspaceMemberId = req.workspaceMember?.id;
    const data = await this.documentService.lock(workspaceId, workspaceMemberId!, documentId);
    return { message: "Document locked successfully.", data };
  }

  @ApiOperation({ summary: "Un-lock Document" })
  @Post(':documentId/unlock')
  async unlock(@Param('workspaceId') workspaceId: string, @Param('documentId') documentId: string, @Req() req: Request) {
    const workspaceMemberId = req.workspaceMember?.id;
    const data = await this.documentService.unlock(workspaceId, workspaceMemberId!, documentId);
    return { message: "Document unlocked successfully.", data };
  }

  @ApiOperation({ summary: "Publish Document", description: "Publishes a draft document. Only workspace owner can publish." })
  @Post(':documentId/publish')
  async publish(@Param('workspaceId') workspaceId: string, @Param('documentId') documentId: string, @Req() req: Request) {
    const workspaceMemberId = req.workspaceMember?.id;
    const data = await this.documentService.publish(workspaceId, workspaceMemberId!, documentId);
    return { message: "Document published successfully.", data };
  }

  @ApiOperation({ summary: "Archive Document", description: "Archive a document. Only workspace owner can archive." })
  @Post(':documentId/archive')
  async archive(@Param('workspaceId') workspaceId: string, @Param('documentId') documentId: string, @Req() req: Request) {
    const workspaceMemberId = req.workspaceMember?.id;
    const data = await this.documentService.archive(workspaceId, workspaceMemberId!, documentId);
    return { message: "Document archived successfully.", data };
  }

  @ApiOperation({ summary: "Restore Document", description: "Restore an archived document back to draft. Only workspace owner can restore." })
  @Post(':documentId/restore')
  async restore(@Param('workspaceId') workspaceId: string, @Param('documentId') documentId: string, @Req() req: Request) {
    const workspaceMemberId = req.workspaceMember?.id;
    const data = await this.documentService.restore(workspaceId, workspaceMemberId!, documentId);
    return { message: "Document restored to draft successfully.", data };
  }
}


