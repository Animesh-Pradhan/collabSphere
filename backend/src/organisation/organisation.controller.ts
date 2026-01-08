import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, Put, Query } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public, Roles } from 'src/common/roles/roles.decorator';
import { Role } from 'src/common/roles/roles.enum';
import { UploadInterceptor } from 'src/common/upload/upload.interceptor';
import { AcceptInviteDto, InviteOrganisationMemberDto } from './dto/other-helpert.dto';

@ApiTags('Organisation')
@Controller('organisation')
@UseGuards(JwtGuard, RolesGuard)
export class OrganisationController {
  constructor(private readonly organisationService: OrganisationService) { }

  @Roles(Role.USER)
  @UseInterceptors(UploadInterceptor("ORGANISATION_LOGO"))
  @ApiOperation({ summary: 'Create Organisation', description: 'Create a new organisation / workspace' })
  @Post()
  async create(@Req() req: any, @Body() createOrganisationDto: CreateOrganisationDto, @UploadedFile() file: Express.Multer.File) {
    const data = await this.organisationService.create(req.user.sub as string, createOrganisationDto, file);
    return { message: "A Organisation added succesfully.", data }
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Get all organisation", description: "Get all organisation FOR SUPER ADMIN" })
  @Get()
  async findAll() {
    const data = await this.organisationService.findAll();
    return { message: "All Organisation fetched succesfully.", data }
  }

  @Roles(Role.USER)
  @ApiOperation({ summary: "Get all organisation By MEMBER", description: "Get all organisation FOR MEMBER" })
  @Get("my-organisation")
  async findAllById(@Req() req: any) {
    const data = await this.organisationService.findAllById(req.user.sub as string);
    return { message: "All Organisation fetched succesfully.", data }
  }

  @Roles(Role.USER)
  @ApiOperation({ summary: "Get organisation details", description: "Get organisation Details by id" })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.organisationService.findOne(id);
    return { data, message: "Succesfully fetched the data" }
  }

  @Roles(Role.USER)
  @UseInterceptors(UploadInterceptor("ORGANISATION_LOGO"))
  @ApiOperation({ summary: 'Update Organisation', description: 'Update a existing organisation / workspace' })
  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() updateOrganisationDto: UpdateOrganisationDto, @UploadedFile() file: Express.Multer.File) {
    const data = await this.organisationService.update(id, req.user.sub as string, updateOrganisationDto, file);
    return { data, message: "Data updated succefully" }
  }

  @Roles(Role.USER)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  deleteOne(@Req() req: any, @Param('id') id: string) {
    const data = this.organisationService.deleteOne(req.user.sub as string, req.user.role as string, id);
    return { data, message: "Organisation Deleted Succesfully" }
  }

  @Roles(Role.USER)
  @Post(':id/invite')
  async inviteMember(@Req() req: any, @Param('id') organisationId: string, @Body() dto: InviteOrganisationMemberDto) {
    const data = await this.organisationService.inviteMember(req.user.sub as string, organisationId, dto);
    return { data, message: 'Invitation sent successfully' };
  }

  @Roles(Role.USER)
  @Post("invite/accept")
  async acceptInvite(@Req() req: any, @Body() dto: AcceptInviteDto) {
    const currentGateToken = req.gateToken;
    const { context, gateToken, user } = await this.organisationService.acceptInvite(req.user.sub as string, dto.token, currentGateToken as string);
    return {
      message: 'Invitation accepted successfully', data: {
        user: { id: user.id, email: user.email },
        gateToken,
        context: context.organisation ? { mode: context.mode, organisation: context.organisation } : null
      }
    };
  }

  @Public()
  @Get('invite/preview')
  async previewInvite(@Query('token') token: string) {
    const data = await this.organisationService.previewInvite(token);
    return { data, message: "Invite verified succesfully" }
  }
}
