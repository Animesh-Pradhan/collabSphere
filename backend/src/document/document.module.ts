import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { DocumentCommentService } from './comments/document-comment.service';
import { DocumentActivityService } from './document-activity.service';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, DocumentCommentService, DocumentActivityService],
})
export class DocumentModule { }
