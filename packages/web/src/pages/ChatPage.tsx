import { useState, useEffect, useRef } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
  Cell,
  WriteBar,
  WriteBarIcon,
  PanelHeaderBack,
  Avatar,
  Spinner,
} from '@vkontakte/vkui';
import {
  Icon28AttachOutline,
  Icon28VoiceOutline,
  Icon28SendOutline,
} from '@vkontakte/icons';
import { getMessages, getChat, uploadFile } from '../services/api';
import { websocketService } from '../services/websocket';
import { Message, Chat } from '../types';
import { useAuth } from '../hooks/useAuth';

interface ChatPageProps {
  id: string;
  chatId: string;
  onBack: () => void;
}

export const ChatPage = ({ id, chatId, onBack }: ChatPageProps) => {
  const { user } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChat();
    loadMessages();
    websocketService.joinChat(chatId);

    const handleNewMessage = (message: Message) => {
      if (message.chatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    websocketService.onMessage(handleNewMessage);

    return () => {
      websocketService.leaveChat(chatId);
      websocketService.offMessage(handleNewMessage);
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = async () => {
    try {
      const data = await getChat(chatId);
      setChat(data);
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await getMessages(chatId);
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      websocketService.sendMessage(chatId, 'text', inputValue.trim());
      setInputValue('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadResponse = await uploadFile(file);
      websocketService.sendMessage(
        chatId,
        'file',
        undefined,
        uploadResponse.filePath,
        uploadResponse.fileName,
        uploadResponse.fileSize,
        uploadResponse.mimeType,
      );
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice.webm', { type: 'audio/webm' });

        try {
          const uploadResponse = await uploadFile(audioFile);
          websocketService.sendMessage(
            chatId,
            'voice',
            undefined,
            uploadResponse.filePath,
            uploadResponse.fileName,
            uploadResponse.fileSize,
            uploadResponse.mimeType,
          );
        } catch (error) {
          console.error('Failed to upload voice message:', error);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const otherUser = chat?.user1Id === user?.id ? chat?.user2 : chat?.user1;

  return (
    <Panel id={id}>
      <PanelHeader
        before={<PanelHeaderBack onClick={onBack} />}
      >
        {otherUser?.email || 'Chat'}
      </PanelHeader>

      <Group style={{ paddingBottom: '60px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Spinner size="large" />
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwn = message.senderId === user?.id;
              return (
                <Cell
                  key={message.id}
                  before={!isOwn ? <Avatar size={32}>{message.sender.email[0].toUpperCase()}</Avatar> : undefined}
                  style={{
                    display: 'flex',
                    flexDirection: isOwn ? 'row-reverse' : 'row',
                    textAlign: isOwn ? 'right' : 'left',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      background: isOwn ? '#4986cc' : '#e5e5ea',
                      color: isOwn ? 'white' : 'black',
                    }}
                  >
                    {message.type === 'text' && message.content}
                    {message.type === 'voice' && (
                      <audio controls src={message.filePath} />
                    )}
                    {message.type === 'file' && (
                      <a href={message.filePath} download={message.fileName}>
                        📎 {message.fileName}
                      </a>
                    )}
                    <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
                      {new Date(message.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </Cell>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Group>

      <div style={{ position: 'fixed', bottom: 0, width: '100%', background: 'white' }}>
        <WriteBar
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          before={
            <>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <WriteBarIcon
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon28AttachOutline />
              </WriteBarIcon>
            </>
          }
          after={
            <>
              <WriteBarIcon
                onClick={recording ? stopRecording : startRecording}
                style={{ color: recording ? 'red' : undefined }}
              >
                <Icon28VoiceOutline />
              </WriteBarIcon>
              <WriteBarIcon onClick={handleSend}>
                <Icon28SendOutline />
              </WriteBarIcon>
            </>
          }
          placeholder="Type a message..."
        />
      </div>
    </Panel>
  );
};
