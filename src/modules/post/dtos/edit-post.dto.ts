import { PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';

// Partial of CreatePostDto
export class EditPostDto extends PartialType(CreatePostDto) {}
