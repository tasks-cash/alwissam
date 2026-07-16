import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { memoryStorage } from "multer";
import type { Response } from "express";
import { CurrentUser } from "../common/auth/current-user.decorator";
import {
  PermissionsGuard,
  RequireRoles,
  RolesGuard,
} from "../common/auth/permissions.guard";
import type { AuthUser } from "../common/auth/session.guard";
import { JwtAuthGuard } from "../common/auth/session.guard";
import {
  StaffChatDeleteDto,
  StaffChatMarkReadDto,
  StaffChatSendTextDto,
} from "./dto/staff-chat.dto";
import { StaffChatGateway } from "./staff-chat.gateway";
import { StaffChatService } from "./staff-chat.service";

@ApiTags("staff-chat")
@Controller("api/staff/chat")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@RequireRoles(
  "ADMIN",
  "ADMIN_OWNER",
  "OWNER",
  "SUPER_ADMIN",
  "DOCTOR_SPECIALIST",
  "DOCTOR_GENERAL",
  "SECRETARY",
)
export class StaffChatController {
  constructor(
    private readonly chat: StaffChatService,
    private readonly gateway: StaffChatGateway,
  ) {}

  @Get()
  overview(
    @CurrentUser() user: AuthUser,
    @Query("markRead") markRead?: string,
  ) {
    return this.chat.overview(user, markRead === "1");
  }

  @Get("unread")
  unread(@CurrentUser() user: AuthUser) {
    return this.chat.unreadCount(user);
  }

  @Get("search")
  search(@CurrentUser() user: AuthUser, @Query("q") q?: string) {
    return this.chat.searchStaff(user, q || "");
  }

  @Get("peers")
  peers(@CurrentUser() user: AuthUser, @Query("q") q?: string) {
    return this.chat.searchStaff(user, q || "");
  }

  @Get("thread/:peerId")
  thread(
    @CurrentUser() user: AuthUser,
    @Param("peerId") peerId: string,
    @Query("before") before?: string,
    @Query("limit") limit?: string,
  ) {
    const n = limit ? Number(limit) : 40;
    return this.chat.threadMessages(user, peerId, {
      before,
      limit: Number.isFinite(n) ? n : 40,
    });
  }

  @Post("read")
  @HttpCode(200)
  async markRead(
    @CurrentUser() user: AuthUser,
    @Body() body: StaffChatMarkReadDto,
  ) {
    const result = await this.chat.markConversationRead(user, body.peerId);
    this.gateway.emitMessageRead([user.id, body.peerId], {
      peerId: body.peerId,
      readerId: user.id,
      modified: result.modified,
    });
    return result;
  }

  @Post()
  @HttpCode(200)
  async sendText(
    @CurrentUser() user: AuthUser,
    @Body() body: StaffChatSendTextDto,
  ) {
    const result = await this.chat.sendText(
      user,
      body.receiverId,
      body.body,
      body.clientMessageId,
    );
    if (!result.duplicate) {
      this.gateway.emitNewMessage(body.receiverId, {
        ...result.message,
        fromUserId: user.id,
        fromName: user.fullName,
      });
    }
    return result;
  }

  @Delete()
  @HttpCode(200)
  async remove(
    @CurrentUser() user: AuthUser,
    @Body() body: StaffChatDeleteDto,
  ) {
    const result = await this.chat.deleteMessage(user, body.messageId);
    this.gateway.emitMessageDeleted(result.peerIds, {
      messageId: body.messageId,
      byUserId: user.id,
    });
    return { ok: true };
  }

  @Post("voice")
  @HttpCode(200)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async sendVoice(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body("receiverId") receiverId: string,
    @Body("clientMessageId") clientMessageId?: string,
  ) {
    const result = await this.chat.sendVoice(
      user,
      receiverId,
      file,
      clientMessageId,
    );
    if (!result.duplicate) {
      this.gateway.emitNewMessage(receiverId, {
        ...result.message,
        fromUserId: user.id,
        fromName: user.fullName,
      });
    }
    return result;
  }

  @Get("audio/:messageId")
  audio(
    @CurrentUser() user: AuthUser,
    @Param("messageId") messageId: string,
    @Res() res: Response,
  ) {
    return this.chat.streamAudio(user, messageId, res);
  }
}
