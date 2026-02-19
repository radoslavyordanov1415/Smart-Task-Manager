import React, { useState } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

interface Props {
  onSwitch: () => void;
}

const LoginForm: React.FC<Props> = ({ onSwitch }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Login failed. Check your credentials.';
      setError(msg);
    }
  };

  return (
    <Card className="shadow-sm mx-auto" style={{ maxWidth: 440 }}>
      <Card.Body className="p-4">
        <h4 className="mb-4 text-center fw-bold">Sign In</h4>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label className="fw-semibold">Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="loginPassword">
            <Form.Label className="fw-semibold">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <div className="d-grid mb-3">
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" animation="border" /> : 'Sign In'}
            </Button>
          </div>
        </Form>
        <p className="text-center text-muted mb-0">
          No account?{' '}
          <Button variant="link" className="p-0" onClick={onSwitch}>
            Register
          </Button>
        </p>
      </Card.Body>
    </Card>
  );
};

export default LoginForm;
