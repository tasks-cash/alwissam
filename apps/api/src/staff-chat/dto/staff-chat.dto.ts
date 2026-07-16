import { IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class StaffChatSendTextDto {
  @IsMongoId()
  receiverId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  clientMessageId?: string;
}

export class StaffChatDeleteDto {
  @IsMongoId()
  messageId!: string;
}

export class StaffChatTypingDto {
  @IsMongoId()
  peerId!: string;

  @IsOptional()
  @IsString()
  state?: "start" | "stop";
}

export class StaffChatMarkReadDto {
  @IsMongoId()
  peerId!: string;
}
