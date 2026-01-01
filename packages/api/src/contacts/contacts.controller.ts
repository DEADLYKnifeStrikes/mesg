import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post()
  async addContact(@Request() req, @Body('contactId') contactId: string) {
    return this.contactsService.addContact(req.user.id, contactId);
  }

  @Get()
  async getContacts(@Request() req) {
    return this.contactsService.getContacts(req.user.id);
  }

  @Delete(':contactId')
  async removeContact(@Request() req, @Param('contactId') contactId: string) {
    return this.contactsService.removeContact(req.user.id, contactId);
  }
}
