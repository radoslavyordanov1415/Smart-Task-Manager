import React from 'react';
import { ButtonGroup, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import type { Priority, TaskStatus } from '../types/Task';

type PriorityFilter = Priority | '';
type StatusFilter = TaskStatus | '';

interface Props {
  priority: PriorityFilter;
  status: StatusFilter;
  search: string;
  onPriorityChange: (f: PriorityFilter) => void;
  onStatusChange: (f: StatusFilter) => void;
  onSearchChange: (s: string) => void;
}

const PRIORITIES: { label: string; value: PriorityFilter; color: string }[] = [
  { label: 'All', value: '', color: 'dark' },
  { label: '🔴 High', value: 'High', color: 'danger' },
  { label: '🟡 Medium', value: 'Medium', color: 'warning' },
  { label: '🟢 Low', value: 'Low', color: 'success' },
];

const STATUSES: { label: string; value: StatusFilter; color: string }[] = [
  { label: 'All', value: '', color: 'dark' },
  { label: 'In Progress', value: 'in-progress', color: 'info' },
  { label: 'Done', value: 'done', color: 'success' },
];

const TaskFilter: React.FC<Props> = ({
  priority, status, search,
  onPriorityChange, onStatusChange, onSearchChange,
}) => {
  const hasFilters = priority !== '' || status !== '' || search !== '';

  return (
    <div className="mb-3">
      <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
        <div>
          <span className="fw-semibold me-2 small text-muted">Priority:</span>
          <ButtonGroup size="sm">
            {PRIORITIES.map(({ label, value, color }) => (
              <Button
                key={value}
                variant={priority === value ? color : 'outline-secondary'}
                onClick={() => onPriorityChange(value)}
                className="filter-pill"
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <div>
          <span className="fw-semibold me-2 small text-muted">Status:</span>
          <ButtonGroup size="sm">
            {STATUSES.map(({ label, value, color }) => (
              <Button
                key={value}
                variant={status === value ? color : 'outline-secondary'}
                onClick={() => onStatusChange(value)}
                className="filter-pill"
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <div style={{ minWidth: 200, maxWidth: 280 }} className="ms-auto">
          <InputGroup size="sm">
            <InputGroup.Text className="bg-white">🔍</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {search && (
              <Button variant="outline-secondary" onClick={() => onSearchChange('')}>✕</Button>
            )}
          </InputGroup>
        </div>
      </div>
      {hasFilters && (
        <div className="d-flex align-items-center gap-1">
          <small className="text-muted">Active filters:</small>
          {priority && <Badge bg="secondary" className="badge-pill">{priority}</Badge>}
          {status && <Badge bg="secondary" className="badge-pill">{status === 'in-progress' ? 'In Progress' : 'Done'}</Badge>}
          {search && <Badge bg="secondary" className="badge-pill">"{search}"</Badge>}
          <Button
            variant="link"
            size="sm"
            className="text-danger p-0 ms-1"
            onClick={() => { onPriorityChange(''); onStatusChange(''); onSearchChange(''); }}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskFilter;

