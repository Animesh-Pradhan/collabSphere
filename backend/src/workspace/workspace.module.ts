import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { AuthModule } from 'src/auth/auth.module';
import { WorkspaceMemberBridgeService } from './workspace-member-bridge.service';

@Module({
  imports: [AuthModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceMemberBridgeService],
  exports: [WorkspaceMemberBridgeService]
})
export class WorkspaceModule { }
