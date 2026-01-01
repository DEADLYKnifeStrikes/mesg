import { useState } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
  FormItem,
  Input,
  Button,
  Cell,
  Avatar,
  Placeholder,
  PanelHeaderBack,
} from '@vkontakte/vkui';
import { Icon28SearchOutline } from '@vkontakte/icons';
import { searchUserByPhone, addContact, createChat } from '../services/api';
import { User } from '../types';

interface SearchPageProps {
  id: string;
  onBack: () => void;
  onChatSelected: (chatId: string) => void;
}

export const SearchPage = ({ id, onBack, onChatSelected }: SearchPageProps) => {
  const [phone, setPhone] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setNotFound(false);
    setSearchResult(null);
    try {
      const user = await searchUserByPhone(phone);
      if (user) {
        setSearchResult(user);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (userId: string) => {
    try {
      await addContact(userId);
      setSearchResult(null);
      setPhone('');
    } catch (error) {
      console.error('Failed to add contact:', error);
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
        Search Users
      </PanelHeader>
      <Group>
        <FormItem top="Phone Number">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
            after={
              <Button
                size="s"
                onClick={handleSearch}
                loading={loading}
              >
                <Icon28SearchOutline width={20} height={20} />
              </Button>
            }
          />
        </FormItem>

        {searchResult && (
          <Cell
            before={<Avatar size={48}>{searchResult.email[0].toUpperCase()}</Avatar>}
            subtitle={searchResult.phone}
            after={
              <>
                <Button
                  size="s"
                  mode="secondary"
                  onClick={() => handleAddContact(searchResult.id)}
                  style={{ marginRight: '8px' }}
                >
                  Add Contact
                </Button>
                <Button
                  size="s"
                  onClick={() => handleStartChat(searchResult.id)}
                >
                  Chat
                </Button>
              </>
            }
          >
            {searchResult.email}
          </Cell>
        )}

        {notFound && (
          <Placeholder>
            No user found with this phone number.
          </Placeholder>
        )}
      </Group>
    </Panel>
  );
};
