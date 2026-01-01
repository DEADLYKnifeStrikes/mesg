import { useState, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
  Cell,
  Avatar,
  Placeholder,
  Button,
  Tabbar,
  TabbarItem,
  Spinner,
} from '@vkontakte/vkui';
import {
  Icon28MessageOutline,
  Icon28UsersOutline,
  Icon28SearchOutline,
  Icon28UserCircleOutline,
  Icon28CheckCircleFill,
  Icon28CancelCircleFill,
} from '@vkontakte/icons';
import { getUserChats } from '../services/api';
import { Chat } from '../types';
import { useAuth } from '../hooks/useAuth';

interface ChatsListPageProps {
  id: string;
  onChatSelected: (chatId: string) => void;
  onSearchClick: () => void;
  onContactsClick: () => void;
  onVerifyClick: () => void;
  onLogout: () => void;
}

export const ChatsListPage = ({ 
  id, 
  onChatSelected, 
  onSearchClick, 
  onContactsClick,
  onVerifyClick,
  onLogout,
}: ChatsListPageProps) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('chats');

  useEffect(() => {
    if (selectedTab === 'chats') {
      loadChats();
    }
  }, [selectedTab]);

  const loadChats = async () => {
    setLoading(true);
    try {
      const data = await getUserChats();
      setChats(data);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Panel id={id}>
      <PanelHeader>MESG</PanelHeader>
      
      {selectedTab === 'chats' && (
        <Group>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Spinner size="large" />
            </div>
          ) : chats.length === 0 ? (
            <Placeholder
              icon={<Icon28MessageOutline />}
              action={
                <Button size="m" onClick={onSearchClick}>
                  Search Users
                </Button>
              }
            >
              No chats yet. Search for users to start chatting.
            </Placeholder>
          ) : (
            chats.map((chat) => (
              <Cell
                key={chat.id}
                before={<Avatar size={48}>{chat.otherUser.email[0].toUpperCase()}</Avatar>}
                subtitle={
                  chat.lastMessage
                    ? chat.lastMessage.type === 'text'
                      ? chat.lastMessage.content
                      : `[${chat.lastMessage.type}]`
                    : 'No messages yet'
                }
                description={chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : ''}
                onClick={() => onChatSelected(chat.id)}
              >
                {chat.otherUser.email}
              </Cell>
            ))
          )}
        </Group>
      )}

      {selectedTab === 'profile' && (
        <Group>
          <Cell
            before={<Avatar size={48}>{user?.email[0].toUpperCase()}</Avatar>}
            subtitle={user?.phone}
            description={
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {user?.phoneVerified ? (
                  <>
                    <Icon28CheckCircleFill width={16} height={16} style={{ color: 'green' }} />
                    Verified
                  </>
                ) : (
                  <>
                    <Icon28CancelCircleFill width={16} height={16} style={{ color: 'orange' }} />
                    Not verified
                  </>
                )}
              </div>
            }
          >
            {user?.email}
          </Cell>

          {!user?.phoneVerified && (
            <Cell>
              <Button size="l" stretched onClick={onVerifyClick}>
                Verify Phone Number
              </Button>
            </Cell>
          )}

          <Cell>
            <Button size="l" stretched mode="destructive" onClick={onLogout}>
              Logout
            </Button>
          </Cell>
        </Group>
      )}

      <Tabbar>
        <TabbarItem
          selected={selectedTab === 'chats'}
          onClick={() => setSelectedTab('chats')}
          text="Chats"
        >
          <Icon28MessageOutline />
        </TabbarItem>
        <TabbarItem
          onClick={onContactsClick}
          text="Contacts"
        >
          <Icon28UsersOutline />
        </TabbarItem>
        <TabbarItem
          onClick={onSearchClick}
          text="Search"
        >
          <Icon28SearchOutline />
        </TabbarItem>
        <TabbarItem
          selected={selectedTab === 'profile'}
          onClick={() => setSelectedTab('profile')}
          text="Profile"
        >
          <Icon28UserCircleOutline />
        </TabbarItem>
      </Tabbar>
    </Panel>
  );
};
