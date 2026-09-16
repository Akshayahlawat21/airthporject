import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from './jobs/jobs.module';
import { Job } from './jobs/entities/job.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: 'jobs.sqlite',
      autoSave: true,
      entities: [Job],
      synchronize: true,
      logging: false,
    }),
    JobsModule,
  ],
})
export class AppModule {}
