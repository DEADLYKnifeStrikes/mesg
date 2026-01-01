import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async addContact(userId: string, contactId: string) {
    // Check if contact already exists
    const existing = await this.prisma.contact.findUnique({
      where: {
        userId_contactId: {
          userId,
          contactId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Add contact
    return this.prisma.contact.create({
      data: {
        userId,
        contactId,
      },
      include: {
        contact: {
          select: {
            id: true,
            email: true,
            phone: true,
            phoneVerified: true,
          },
        },
      },
    });
  }

  async getContacts(userId: string) {
    const contacts = await this.prisma.contact.findMany({
      where: { userId },
      include: {
        contact: {
          select: {
            id: true,
            email: true,
            phone: true,
            phoneVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contacts.map(c => c.contact);
  }

  async removeContact(userId: string, contactId: string) {
    await this.prisma.contact.deleteMany({
      where: {
        userId,
        contactId,
      },
    });

    return { success: true };
  }
}
