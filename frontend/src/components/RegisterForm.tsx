import React, { useState } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

interface Props {
  onSwitch: () => void;
}

const RegisterForm: React.FC<Props> = ({ onSwitch }) => {
  const { register, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      await register(username, email, password);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    }
  };

  return (
    <Card className="shadow-sm mx-auto" style={{ maxWidth: 440 }}>
      <Card.Body className="p-4">
        <h4 className="mb-4 text-center fw-bold">Create Account</h4>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="regUsername">
            <Form.Label className="fw-semibold">Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              minLength={3}
              maxLength={30}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="regEmail">
            <Form.Label className="fw-semibold">Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="regPassword">
            <Form.Label className="fw-semibold">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="regConfirm">
            <Form.Label className="fw-semibold">Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </Form.Group>
          <div className="d-grid mb-3">
            <Button variant="success" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" animation="border" /> : 'Create Account'}
            </Button>
          </div>
        </Form>
        <p className="text-center text-muted mb-0">
          Already have an account?{' '}
          <Button variant="link" className="p-0" onClick={onSwitch}>
            Sign In
          </Button>
        </p>
      </Card.Body>
    </Card>
  );
};

export default RegisterForm;
