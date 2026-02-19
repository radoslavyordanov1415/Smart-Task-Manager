import React from 'react';
import { Card, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import type { Analytics as AnalyticsData } from '../types/Task';

interface Props {
  data: AnalyticsData | null;
}

/** SVG donut ring showing completion percentage */
function CompletionRing({ pct }: { pct: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg className="completion-ring" viewBox="0 0 72 72">
      <circle className="completion-ring-bg" cx="36" cy="36" r={r} />
      <circle
        className="completion-ring-fg"
        cx="36" cy="36" r={r}
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
      <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill="#22c55e">
        {pct}%
      </text>
    </svg>
  );
}

const Analytics: React.FC<Props> = ({ data }) => {
  if (!data) {
    return <p className="text-muted">Loading analytics…</p>;
  }

  const completionPct =
    data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

  return (
    <>
      {/* ── Summary cards ─────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="stat-card text-center h-100">
            <Card.Body>
              <Card.Title className="display-6 fw-bold text-primary">{data.total}</Card.Title>
              <Card.Text className="text-muted small">Total Tasks</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card text-center h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              <CompletionRing pct={completionPct} />
              <Card.Text className="text-muted small mt-2">
                {data.completed} Completed
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card text-center h-100">
            <Card.Body>
              <Card.Title className="display-6 fw-bold text-warning">{data.pending}</Card.Title>
              <Card.Text className="text-muted small">Pending</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card text-center h-100">
            <Card.Body>
              <Card.Title className="display-6 fw-bold" style={{ color: '#6366f1' }}>{data.thisWeek}</Card.Title>
              <Card.Text className="text-muted small">Created This Week</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Breakdown cards ───────────────────────────────────── */}
      <Row className="g-3">
        <Col md={4}>
          <Card>
            <Card.Header className="fw-semibold bg-white">Tasks by Priority</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between">
                <span><Badge bg="danger" className="badge-pill me-2">High</Badge></span>
                <strong>{data.byPriority.High}</strong>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span><Badge bg="warning" className="badge-pill me-2">Medium</Badge></span>
                <strong>{data.byPriority.Medium}</strong>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span><Badge bg="success" className="badge-pill me-2">Low</Badge></span>
                <strong>{data.byPriority.Low}</strong>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header className="fw-semibold bg-white">Tasks by Status</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between">
                <span><Badge bg="info" className="badge-pill me-2">In Progress</Badge></span>
                <strong>{data.byStatus['in-progress']}</strong>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span><Badge bg="success" className="badge-pill me-2">Done</Badge></span>
                <strong>{data.byStatus.done}</strong>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header className="fw-semibold bg-white">Top Tasks by Priority</Card.Header>
            {data.sortedByPriority.length === 0 ? (
              <Card.Body className="text-muted small">No tasks yet.</Card.Body>
            ) : (
              <ListGroup variant="flush">
                {data.sortedByPriority.slice(0, 5).map((task) => (
                  <ListGroup.Item
                    key={task._id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span
                      className={task.completed ? 'task-title-done' : ''}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '65%',
                      }}
                    >
                      {task.title}
                    </span>
                    <Badge
                      bg={
                        task.priority === 'High'
                          ? 'danger'
                          : task.priority === 'Medium'
                          ? 'warning'
                          : 'success'
                      }
                      className="badge-pill"
                    >
                      {task.priority}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Analytics;

