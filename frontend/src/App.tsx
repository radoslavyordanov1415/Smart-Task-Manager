import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Navbar,
  Nav,
  Tab,
  Alert,
  Spinner,
  Dropdown,
  Placeholder,
} from 'react-bootstrap';
import TaskForm from './components/TaskForm';
import TaskFilter from './components/TaskFilter';
import TaskTable from './components/TaskTable';
import Analytics from './components/Analytics';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import EditTaskModal from './components/EditTaskModal';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import {
  fetchTasks,
  toggleTaskComplete,
  deleteTask,
  fetchAnalytics,
} from './services/api';
import type {
  Task,
  Analytics as AnalyticsData,
  Priority,
  TaskStatus,
} from './types/Task';

type PriorityFilter = Priority | '';
type StatusFilter = TaskStatus | '';

// ─── Auth Gate ──────────────────────────────────────────────────────────────

function AuthGate() {
  const [view, setView] = useState<'login' | 'register'>('login');
  return (
    <div className="auth-bg d-flex flex-column min-vh-100 justify-content-center">
      <Container style={{ maxWidth: 480 }} className="py-5">
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem' }}>📋</div>
          <h3 className="fw-bold mt-2">Smart Task Manager</h3>
          <p className="text-muted small">Organize your work, track your progress.</p>
        </div>
        {view === 'login' ? (
          <LoginForm onSwitch={() => setView('register')} />
        ) : (
          <RegisterForm onSwitch={() => setView('login')} />
        )}
      </Container>
    </div>
  );
}

// ─── Skeleton loader ────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="mt-3">
      {[1, 2, 3, 4].map((i) => (
        <Placeholder key={i} as="div" animation="glow" className="mb-2">
          <Placeholder xs={12} className="rounded" style={{ height: 42 }} />
        </Placeholder>
      ))}
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

function Dashboard() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [search, setSearch] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [globalError, setGlobalError] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadData = useCallback(async () => {
    setLoadingTasks(true);
    setGlobalError('');
    try {
      const [paginatedData, analyticsData] = await Promise.all([
        fetchTasks({ priority: priorityFilter, status: statusFilter }),
        fetchAnalytics(),
      ]);
      setTasks(paginatedData.tasks);
      setTotalTasks(paginatedData.total);
      setAnalytics(analyticsData);
    } catch {
      setGlobalError(
        'Cannot reach the backend. Make sure the server is running on port 5000.',
      );
    } finally {
      setLoadingTasks(false);
    }
  }, [priorityFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side search filter
  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tasks, search]);

  const handleToggle = async (id: string) => {
    try {
      await toggleTaskComplete(id);
      await loadData();
      showToast('Task status updated', 'info');
    } catch {
      showToast('Failed to toggle task', 'danger');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      await loadData();
      showToast('Task deleted', 'warning');
    } catch {
      showToast('Failed to delete task', 'danger');
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <Navbar expand="lg" className="app-navbar mb-4 shadow-sm sticky-top">
        <Container>
          <Navbar.Brand href="#" className="d-flex align-items-center gap-2 fw-bold">
            <span style={{ fontSize: '1.4rem' }}>📋</span>
            Smart Task Manager
          </Navbar.Brand>
          <Nav className="ms-auto align-items-center gap-3">
            <span className="d-none d-md-inline text-muted small">
              {greeting()}, <strong>{user?.username}</strong>
            </span>
            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                role="button"
                className="user-avatar"
                title={user?.username}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow-sm">
                <Dropdown.Header>
                  <strong>{user?.username}</strong>
                  <br />
                  <small className="text-muted">{user?.email}</small>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item onClick={logout} className="text-danger">
                  Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>

      <Container className="pb-5">
        {globalError && (
          <Alert variant="danger" dismissible onClose={() => setGlobalError('')}>
            {globalError}
          </Alert>
        )}

        <Tab.Container defaultActiveKey="tasks">
          <Nav variant="pills" className="mb-4 gap-2">
            <Nav.Item>
              <Nav.Link eventKey="tasks" className="nav-pill-custom">📋 Tasks</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="analytics" className="nav-pill-custom">📊 Analytics</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="tasks">
              <TaskForm onTaskCreated={loadData} />
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                <h5 className="mb-0 fw-bold">
                  Task List{' '}
                  <span className="text-muted fs-6 fw-normal">
                    ({filteredTasks.length}{search ? ` of ${totalTasks}` : ''} task{totalTasks !== 1 ? 's' : ''})
                  </span>
                </h5>
              </div>
              <TaskFilter
                priority={priorityFilter}
                status={statusFilter}
                search={search}
                onPriorityChange={setPriorityFilter}
                onStatusChange={setStatusFilter}
                onSearchChange={setSearch}
              />
              {loadingTasks ? (
                <TableSkeleton />
              ) : (
                <TaskTable
                  tasks={filteredTasks}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={setEditingTask}
                />
              )}
            </Tab.Pane>

            <Tab.Pane eventKey="analytics">
              <h5 className="mb-4 fw-bold">Analytics Overview</h5>
              {loadingTasks ? (
                <TableSkeleton />
              ) : (
                <Analytics data={analytics} />
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>

      <EditTaskModal
        task={editingTask}
        show={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={loadData}
      />
    </>
  );
}

// ─── App Root ────────────────────────────────────────────────────────────────

function App() {
  const { token } = useAuth();
  return token ? <Dashboard /> : <AuthGate />;
}

export default App;

