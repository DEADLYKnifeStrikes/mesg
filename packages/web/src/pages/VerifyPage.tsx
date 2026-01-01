import { useState, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
  Cell,
  Button,
  Placeholder,
  PanelHeaderBack,
} from '@vkontakte/vkui';
import { Icon28CheckCircleFill, Icon28CancelCircleFill } from '@vkontakte/icons';
import { useAuth } from '../hooks/useAuth';
import { generateVerificationLink, getCurrentUser } from '../services/api';

interface VerifyPageProps {
  id: string;
  onBack: () => void;
}

export const VerifyPage = ({ id, onBack }: VerifyPageProps) => {
  const { user, updateUser } = useAuth();
  const [deepLink, setDeepLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Poll for verification status
    const interval = setInterval(async () => {
      try {
        const updatedUser = await getCurrentUser();
        updateUser(updatedUser);
      } catch (error) {
        console.error('Failed to update user:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [updateUser]);

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const response = await generateVerificationLink();
      setDeepLink(response.deepLink);
    } catch (error) {
      console.error('Failed to generate link:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>
        Phone Verification
      </PanelHeader>
      <Group>
        {user?.phoneVerified ? (
          <Placeholder
            icon={<Icon28CheckCircleFill style={{ color: 'green' }} />}
            header="Phone Verified"
          >
            Your phone number has been verified via Telegram.
          </Placeholder>
        ) : (
          <>
            <Placeholder
              icon={<Icon28CancelCircleFill style={{ color: 'orange' }} />}
              header="Phone Not Verified"
            >
              Verify your phone number using Telegram bot.
            </Placeholder>

            <Cell>
              <Button
                size="l"
                stretched
                onClick={handleGenerateLink}
                loading={loading}
                disabled={!!deepLink}
              >
                Generate Verification Link
              </Button>
            </Cell>

            {deepLink && (
              <Cell>
                <a
                  href={deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button size="l" stretched mode="secondary">
                    Open Telegram
                  </Button>
                </a>
              </Cell>
            )}

            {deepLink && (
              <Cell multiline>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Link: {deepLink}
                </div>
              </Cell>
            )}
          </>
        )}
      </Group>
    </Panel>
  );
};
