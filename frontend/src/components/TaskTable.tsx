import React from 'react';
import {
  Table, Badge, Button, Spinner, Modal,
  OverlayTrigger, Tooltip,
} from 'react-bootstrap';
import type { Task, Priority, TaskStatus } from '../types/Task';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
}

const priorityVariant: Record<Priority, string> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'success',
};

const statusVariant: Record<TaskStatus, string> = {
  'in-progress': 'info',
  done: 'success',
};

const statusLabel: Record<TaskStatus, string> = {
  'in-progress': 'In Progress',
  done: 'Done',
};

function isOverdue(dueDate?: string, completed?: boolean): boolean {
  if (!dueDate || completed) return false;
  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
}

const TaskTable: React.FC<Props> = ({ tasks, onToggle, onDelete, onEdit }) => {
  const [loadingToggle, setLoadingToggle] = React.useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = React.useState<string | null>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  const handleToggle = async (id: string) => {
    setLoadingToggle(id);
    try { await onToggle(id); } finally { setLoadingToggle(null); }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setLoadingDelete(confirmId);
    setConfirmId(null);
    try { await onDelete(confirmId); } finally { setLoadingDelete(null); }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: '3.5rem', opacity: 0.25 }}>📋</div>
        <p className="text-muted mt-2 mb-3">No tasks yet — your list is empty.</p>
        <p className="text-muted small">Click <strong>+ New Task</strong> above to get started!</p>
      </div>
    );
  }

  const tip = (text: string) => <Tooltip>{text}</Tooltip>;

  return (
    <>
      <Table responsive bordered hover className="align-middle task-table">
        <thead>
          <tr>
            <th style={{ width: '2.5rem' }}>#</th>
            <th>Title</th>
            <th style={{ width: '7.5rem' }}>Priority</th>
            <th style={{ width: '8.5rem' }}>Status</th>
            <th style={{ width: '8rem' }}>Due Date</th>
            <th style={{ width: '8rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, idx) => {
            const overdue = isOverdue(task.dueDate, task.completed);
            return (
              <tr
                key={task._id}
                className={task.completed ? 'task-row-done' : overdue ? 'task-row-overdue' : ''}
              >
                <td className="text-muted">{idx + 1}</td>
                <td
                  className={task.completed ? 'task-title-done' : ''}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onEdit(task)}
                >
                  {task.title}
                </td>
                <td>
                  <Badge bg={priorityVariant[task.priority]} className="badge-pill">{task.priority}</Badge>
                </td>
                <td>
                  <Badge bg={statusVariant[task.status]} className="badge-pill">{statusLabel[task.status]}</Badge>
                </td>
                <td className={`small ${overdue ? 'text-danger fw-semibold' : 'text-muted'}`}>
                  {task.dueDate
                    ? (<>{new Date(task.dueDate).toLocaleDateString()}{overdue && <Badge bg="danger" className="ms-1" style={{ fontSize: '0.65rem' }}>Overdue</Badge>}</>)
                    : '—'}
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <OverlayTrigger placement="top" overlay={tip(task.completed ? 'Mark incomplete' : 'Mark complete')}>
                      <Button
                        variant={task.completed ? 'success' : 'outline-secondary'}
                        size="sm"
                        className="btn-icon"
                        onClick={() => handleToggle(task._id)}
                        disabled={loadingToggle === task._id}
                      >
                        {loadingToggle === task._id
                          ? <Spinner as="span" animation="border" size="sm" />
                          : task.completed ? '✓' : '○'}
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={tip('Edit task')}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="btn-icon"
                        onClick={() => onEdit(task)}
                      >
                        ✎
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={tip('Delete task')}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="btn-icon"
                        onClick={() => setConfirmId(task._id)}
                        disabled={loadingDelete === task._id}
                      >
                        {loadingDelete === task._id
                          ? <Spinner as="span" animation="border" size="sm" />
                          : '🗑'}
                      </Button>
                    </OverlayTrigger>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Delete confirmation modal */}
      <Modal show={!!confirmId} onHide={() => setConfirmId(null)} centered size="sm">
        <Modal.Body className="text-center py-4">
          <div style={{ fontSize: '2.5rem' }}>🗑️</div>
          <p className="fw-semibold mt-2 mb-1">Delete this task?</p>
          <p className="text-muted small mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pt-0">
          <Button variant="outline-secondary" size="sm" onClick={() => setConfirmId(null)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TaskTable;

