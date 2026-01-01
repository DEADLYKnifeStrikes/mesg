import { Controller, Get } from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Simple health endpoint for the uploads module.
   * Actual file serving is done via static assets in main.ts.
   */
  @Get('health')
  health() {
    return this.uploadsService.health();
  }
}
