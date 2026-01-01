import { useState } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
  FormItem,
  Input,
  Button,
  Tabs,
  TabsItem,
} from '@vkontakte/vkui';
import { register, login } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface AuthPageProps {
  id: string;
}

export const AuthPage = ({ id }: AuthPageProps) => {
  const { login: authLogin } = useAuth();
  const [selected, setSelected] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await register(email, phone, password);
      authLogin(response.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await login(email, password);
      authLogin(response.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel id={id}>
      <PanelHeader>MESG</PanelHeader>
      <Group>
        <Tabs>
          <TabsItem
            selected={selected === 'login'}
            onClick={() => setSelected('login')}
          >
            Login
          </TabsItem>
          <TabsItem
            selected={selected === 'register'}
            onClick={() => setSelected('register')}
          >
            Register
          </TabsItem>
        </Tabs>

        <FormItem top="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </FormItem>

        {selected === 'register' && (
          <FormItem top="Phone">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
            />
          </FormItem>
        )}

        <FormItem top="Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </FormItem>

        {error && (
          <FormItem>
            <div style={{ color: 'red' }}>{error}</div>
          </FormItem>
        )}

        <FormItem>
          <Button
            size="l"
            stretched
            onClick={selected === 'login' ? handleLogin : handleRegister}
            loading={loading}
          >
            {selected === 'login' ? 'Login' : 'Register'}
          </Button>
        </FormItem>
      </Group>
    </Panel>
  );
};
