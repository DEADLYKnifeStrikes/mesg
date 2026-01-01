import { useState, useEffect } from 'react';
import {
  ConfigProvider,
  AdaptivityProvider,
  AppRoot,
  SplitLayout,
  SplitCol,
  View,
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import { AuthProvider, useAuth } from './hooks/useAuth';
import { AuthPage } from './pages/AuthPage';
import { ChatsListPage } from './pages/ChatsListPage';
import { ChatPage } from './pages/ChatPage';
import { SearchPage } from './pages/SearchPage';
import { ContactsPage } from './pages/ContactsPage';
import { VerifyPage } from './pages/VerifyPage';

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const [activePanel, setActivePanel] = useState('chats');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      setActivePanel('auth');
    } else if (!loading && user) {
      setActivePanel('chats');
    }
  }, [user, loading]);

  const handleChatSelected = (chatId: string) => {
    setSelectedChatId(chatId);
    setActivePanel('chat');
  };

  const handleBackToChats = () => {
    setActivePanel('chats');
    setSelectedChatId(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SplitLayout>
      <SplitCol>
        <View activePanel={activePanel}>
          <AuthPage id="auth" />
          
          <ChatsListPage
            id="chats"
            onChatSelected={handleChatSelected}
            onSearchClick={() => setActivePanel('search')}
            onContactsClick={() => setActivePanel('contacts')}
            onVerifyClick={() => setActivePanel('verify')}
            onLogout={logout}
          />

          <ChatPage
            id="chat"
            chatId={selectedChatId || ''}
            onBack={handleBackToChats}
          />

          <SearchPage
            id="search"
            onBack={handleBackToChats}
            onChatSelected={handleChatSelected}
          />

          <ContactsPage
            id="contacts"
            onBack={handleBackToChats}
            onChatSelected={handleChatSelected}
          />

          <VerifyPage
            id="verify"
            onBack={handleBackToChats}
          />
        </View>
      </SplitCol>
    </SplitLayout>
  );
};

function App() {
  return (
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
}

export default App;
