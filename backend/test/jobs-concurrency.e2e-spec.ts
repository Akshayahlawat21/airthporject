import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from '../src/jobs/jobs.module';
import { Job } from '../src/jobs/entities/job.entity';
import { JobStatus } from '../src/common/enums/job-status.enum';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

describe('Job Queue Lifecycle & Concurrency (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:', // In-memory database for fast, isolated test runs
          entities: [Job],
          synchronize: true,
          logging: false,
        }),
        JobsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. CRUD & Standard State Transitions', () => {
    let createdJobId: string;

    it('POST /jobs -> should create a new job in PENDING status', async () => {
      const res = await request(app.getHttpServer())
        .post('/jobs')
        .send({
          title: 'Generate Annual Financial Report',
          type: 'report-generation',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Generate Annual Financial Report');
      expect(res.body.type).toBe('report-generation');
      expect(res.body.status).toBe(JobStatus.PENDING);
      createdJobId = res.body.id;
    });

    it('GET /jobs -> should list jobs with metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/jobs')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((j: Job) => j.id === createdJobId)).toBe(true);
    });

    it('GET /jobs/metrics -> should return aggregated status counts', async () => {
      const res = await request(app.getHttpServer())
        .get('/jobs/metrics')
        .expect(200);

      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('pending');
      expect(res.body).toHaveProperty('running');
      expect(res.body).toHaveProperty('completed');
      expect(res.body).toHaveProperty('failed');
      expect(res.body.pending).toBeGreaterThanOrEqual(1);
    });

    it('PATCH /jobs/:id/status -> should transition PENDING to RUNNING', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/jobs/${createdJobId}/status`)
        .send({ status: JobStatus.RUNNING })
        .expect(200);

      expect(res.body.status).toBe(JobStatus.RUNNING);
    });

    it('PATCH /jobs/:id/status -> should transition RUNNING to COMPLETED', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/jobs/${createdJobId}/status`)
        .send({ status: JobStatus.COMPLETED })
        .expect(200);

      expect(res.body.status).toBe(JobStatus.COMPLETED);
    });
  });

  describe('2. State Machine Enforcement (Bypassing Frontend)', () => {
    let testJobId: string;

    beforeEach(async () => {
      // Create fresh job
      const res = await request(app.getHttpServer())
        .post('/jobs')
        .send({
          title: 'Direct API Transition Test',
          type: 'data-processing',
        })
        .expect(201);
      testJobId = res.body.id;
    });

    it('should reject direct transition from PENDING to COMPLETED (400 Bad Request)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: JobStatus.COMPLETED })
        .expect(400);

      expect(res.body.message).toContain('Cannot transition from \'pending\' to \'completed\'');
    });

    it('should reject transition from COMPLETED to RUNNING (400 Bad Request)', async () => {
      // Move to running then completed
      await request(app.getHttpServer())
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: JobStatus.RUNNING })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: JobStatus.COMPLETED })
        .expect(200);

      // Now attempt illegal backwards transition
      const res = await request(app.getHttpServer())
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: JobStatus.RUNNING })
        .expect(400);

      expect(res.body.message).toContain('Terminal states cannot be modified');
    });

    it('should reject invalid status strings (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: 'invalid-status-xyz' })
        .expect(400);
    });
  });

  describe('3. Concurrency & Race Conditions (Simultaneous Requests)', () => {
    it('should handle simultaneous transitions to RUNNING: exactly 1 succeeds and 1 receives 409 or 400', async () => {
      // Create a pending job
      const createRes = await request(app.getHttpServer())
        .post('/jobs')
        .send({
          title: 'Simultaneous Concurrent Race Condition Test',
          type: 'concurrency-check',
        })
        .expect(201);

      const targetJobId = createRes.body.id;

      // Launch 2 simultaneous requests in parallel
      const [response1, response2] = await Promise.all([
        request(app.getHttpServer())
          .patch(`/jobs/${targetJobId}/status`)
          .send({ status: JobStatus.RUNNING }),
        request(app.getHttpServer())
          .patch(`/jobs/${targetJobId}/status`)
          .send({ status: JobStatus.RUNNING }),
      ]);

      const statuses = [response1.status, response2.status];

      // Verify that exactly one request succeeded with 200 OK
      expect(statuses).toContain(200);

      // Verify that the other request was rejected due to race condition conflict or invalid transition
      const errorResponse = response1.status === 200 ? response2 : response1;
      expect([400, 409]).toContain(errorResponse.status);

      // Verify the final database state is consistent
      const getRes = await request(app.getHttpServer())
        .get(`/jobs/${targetJobId}`)
        .expect(200);

      expect(getRes.body.status).toBe(JobStatus.RUNNING);
    });
  });
});
