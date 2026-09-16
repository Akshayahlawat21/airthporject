"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Job Queue Management API')
        .setDescription('Robust NestJS REST API with SQLite persistence, finite state machine transitions, and atomic optimistic concurrency control.')
        .setVersion('1.0.0')
        .addTag('Jobs', 'Operations for managing asynchronous jobs and status transitions')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 4000;
    await app.listen(port);
    logger.log(`====================================================`);
    logger.log(`🚀 Backend Server running on http://localhost:${port}`);
    logger.log(`📚 Swagger API Docs available at http://localhost:${port}/api/docs`);
    logger.log(`====================================================`);
}
bootstrap();
//# sourceMappingURL=main.js.map