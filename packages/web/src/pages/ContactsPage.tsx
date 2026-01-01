import { useState, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
  Cell,
  Avatar,
  Placeholder,
  PanelHeaderBack,
  Spinner,
} from '@vkontakte/vkui';
import { Icon28UsersOutline } from '@vkontakte/icons';
import { getContacts, createChat } from '../services/api';
import { Contact } from '../types';

interface ContactsPageProps {
  id: string;
  onBack: () => void;
  onChatSelected: (chatId: string) => void;
}

export const ContactsPage = ({ id, onBack, onChatSelected }: ContactsPageProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (userId: string) => {
    try {
      const chat = await createChat(userId);
      onChatSelected(chat.id);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>
        Contacts
      </PanelHeader>
      <Group>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Spinner size="large" />
          </div>
        ) : contacts.length === 0 ? (
          <Placeholder icon={<Icon28UsersOutline />}>
            No contacts yet. Search for users to add them as contacts.
          </Placeholder>
        ) : (
          contacts.map((contact) => (
            <Cell
              key={contact.id}
              before={<Avatar size={48}>{contact.email[0].toUpperCase()}</Avatar>}
              subtitle={contact.phone}
              description={contact.phoneVerified ? 'Verified' : 'Not verified'}
              onClick={() => handleStartChat(contact.id)}
            >
              {contact.email}
            </Cell>
          ))
        )}
      </Group>
    </Panel>
  );
};
