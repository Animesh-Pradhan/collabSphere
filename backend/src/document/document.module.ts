import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { DocumentCommentService } from './comments/document-comment.service';
import { DocumentActivityService } from './document-activity.service';
import { DocumentCommentController } from './comments/document-comment.controller';
import { DocumentAttachmentController } from './document-attachment/document-attachment.controller';
import { DocumentAttachmentService } from './document-attachment/document-attachment.service';
import { DocumentFavoriteController } from './favorites/document-favorite.controller';
import { DocumentFavoriteService } from './favorites/document-favorite.service';

@Module({
  controllers: [DocumentController, DocumentCommentController, DocumentAttachmentController, DocumentFavoriteController],
  providers: [DocumentService, DocumentCommentService, DocumentActivityService, DocumentAttachmentService, DocumentFavoriteService],
})
export class DocumentModule { }
