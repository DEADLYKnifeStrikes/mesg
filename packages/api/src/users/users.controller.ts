import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('search')
  async searchByPhone(@Query('phone') phone: string) {
    return this.usersService.findByPhone(phone);
  }

  @Get('me')
  async getMe(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
