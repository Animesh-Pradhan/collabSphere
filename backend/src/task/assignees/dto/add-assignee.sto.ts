import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ArrayNotEmpty, IsUUID } from "class-validator";

export class AddTaskAssigneesDto {
  @ApiProperty({
    example: ["workspace-member-uuid-1", "workspace-member-uuid-2"],
    description: "Workspace member IDs to assign to the task",
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  workspaceMemberIds: string[];
}