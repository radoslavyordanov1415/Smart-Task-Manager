import React, { useState } from 'react';
import { Button, Form, Row, Col, Alert, Collapse, Card } from 'react-bootstrap';
import type { Priority, TaskStatus } from '../types/Task';
import { createTask } from '../services/api';
import { useToast } from '../context/ToastContext';

interface Props {
  onTaskCreated: () => void;
}

const TaskForm: React.FC<Props> = ({ onTaskCreated }) => {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('in-progress');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createTask(title.trim(), priority, status, dueDate || undefined);
      setTitle('');
      setPriority('Medium');
      setStatus('in-progress');
      setDueDate('');
      showToast('Task created!', 'success');
      onTaskCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <Button
        variant={open ? 'outline-secondary' : 'primary'}
        size="sm"
        onClick={() => setOpen(!open)}
        className="mb-2"
      >
        {open ? '— Hide form' : '+ New Task'}
      </Button>
      <Collapse in={open}>
        <div>
          <Card className="card-modern">
            <Card.Body className="p-3">
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="py-2 small">{error}</Alert>}
                <Row className="g-2 align-items-end">
                  <Col xs={12} md={4}>
                    <Form.Group controlId="taskTitle">
                      <Form.Label className="fw-semibold small text-muted mb-1">Task Title</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="What needs to be done?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                      />
                      <div className="text-end text-muted" style={{ fontSize: '0.7rem' }}>
                        {title.length}/100
                      </div>
                    </Form.Group>
                  </Col>
                  <Col xs={6} md={2}>
                    <Form.Group controlId="taskPriority">
                      <Form.Label className="fw-semibold small text-muted mb-1">Priority</Form.Label>
                      <Form.Select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                      >
                        <option value="Low">🟢 Low</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="High">🔴 High</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={6} md={2}>
                    <Form.Group controlId="taskStatus">
                      <Form.Label className="fw-semibold small text-muted mb-1">Status</Form.Label>
                      <Form.Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TaskStatus)}
                      >
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={2}>
                    <Form.Group controlId="taskDueDate">
                      <Form.Label className="fw-semibold small text-muted mb-1">Due Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={2} className="d-grid">
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? 'Adding…' : '+ Add'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Collapse>
    </div>
  );
};

export default TaskForm;


