import "reflect-metadata";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter";
import { ErrorCodes } from "./common/errors/error-codes";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadRoot =
    process.env.UPLOAD_DIR || join(process.cwd(), "uploads");
  if (!existsSync(uploadRoot)) mkdirSync(uploadRoot, { recursive: true });
  app.useStaticAssets(uploadRoot, { prefix: "/uploads/" });

  app.setGlobalPrefix("");
  app.use(cookieParser());
  app.useGlobalFilters(new ApiExceptionFilter());

  const config = app.get(ConfigService);
  const webOrigin =
    config.get<string>("WEB_ORIGIN") ||
    process.env.WEB_ORIGIN ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3003";

  app.enableCors({
    origin: webOrigin.split(",").map((o) => o.trim()),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const fieldErrors: Record<string, string[]> = {};
        for (const err of errors) {
          const msgs = Object.values(err.constraints || {});
          if (msgs.length) fieldErrors[err.property] = msgs;
        }
        return new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "بيانات النموذج غير صالحة.",
          fieldErrors,
        });
      },
    }),
  );

  const swaggerEnabled =
    process.env.NODE_ENV !== "production" ||
    process.env.SWAGGER_ENABLED === "true";
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Al-Wisam API")
      .setDescription("NestJS + MongoDB API")
      .setVersion("0.1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, document);
  }

  const port = config.get<number>("API_PORT") ?? 4001;
  await app.listen(port);
  console.log(`alwisam-api listening on http://localhost:${port}`);
}

bootstrap();
