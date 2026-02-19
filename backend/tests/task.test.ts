import request from 'supertest';
import app from '../src/app';
import { connectTestDB, disconnectTestDB, clearDB } from './testHelper';

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

afterEach(async () => {
  await clearDB();
});

const testUser = { username: 'taskuser', email: 'tasks@example.com', password: 'password123' };

async function getToken(): Promise<string> {
  const res = await request(app).post('/api/auth/register').send(testUser);
  return res.body.token as string;
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

describe('POST /api/tasks', () => {
  it('creates a task and returns 201 with correct fields', async () => {
    const token = await getToken();
    const res = await request(app)
      .post('/api/tasks')
      .set(auth(token))
      .send({ title: 'Buy groceries', priority: 'High' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Buy groceries');
    expect(res.body.priority).toBe('High');
    expect(res.body.completed).toBe(false);
    expect(res.body.status).toBe('in-progress');
    expect(res.body).toHaveProperty('userId');
  });

  it('creates a task with an optional dueDate', async () => {
    const token = await getToken();
    const res = await request(app)
      .post('/api/tasks')
      .set(auth(token))
      .send({ title: 'Submit report', priority: 'Medium', dueDate: '2026-12-31' });
    expect(res.status).toBe(201);
    expect(res.body.dueDate).toBeTruthy();
  });

  it('returns 400 when title is missing', async () => {
    const token = await getToken();
    const res = await request(app)
      .post('/api/tasks')
      .set(auth(token))
      .send({ priority: 'Low' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when priority is missing', async () => {
    const token = await getToken();
    const res = await request(app)
      .post('/api/tasks')
      .set(auth(token))
      .send({ title: 'Missing priority' });
    expect(res.status).toBe(400);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'No auth', priority: 'Low' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/tasks', () => {
  let token: string;

  beforeEach(async () => {
    token = await getToken();
    await request(app).post('/api/tasks').set(auth(token)).send({ title: 'Task A', priority: 'High' });
    await request(app).post('/api/tasks').set(auth(token)).send({ title: 'Task B', priority: 'Low' });
    await request(app).post('/api/tasks').set(auth(token)).send({ title: 'Task C', priority: 'High' });
  });

  it('returns paginated tasks for the user', async () => {
    const res = await request(app).get('/api/tasks').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(3);
    expect(res.body).toHaveProperty('total', 3);
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('totalPages', 1);
  });

  it('filters tasks by priority', async () => {
    const res = await request(app).get('/api/tasks?priority=High').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
    res.body.tasks.forEach((t: { priority: string }) => expect(t.priority).toBe('High'));
  });

  it('supports pagination via page and limit', async () => {
    const res = await request(app).get('/api/tasks?page=1&limit=2').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
    expect(res.body.totalPages).toBe(2);
  });

  it('returns only the current user tasks (not others)', async () => {
    // Register a second user and create a task
    const otherToken = (
      await request(app).post('/api/auth/register').send({ username: 'other', email: 'other@x.com', password: 'pass123' })
    ).body.token;
    await request(app).post('/api/tasks').set(auth(otherToken)).send({ title: 'Other task', priority: 'Low' });

    const res = await request(app).get('/api/tasks').set(auth(token));
    expect(res.body.total).toBe(3); // still only 3 from first user
  });
});

describe('PATCH /api/tasks/:id/complete', () => {
  let token: string;
  let taskId: string;

  beforeEach(async () => {
    token = await getToken();
    const res = await request(app).post('/api/tasks').set(auth(token)).send({ title: 'Toggle me', priority: 'Medium' });
    taskId = res.body._id;
  });

  it('toggles task completion to true and sets status to done', async () => {
    const res = await request(app).patch(`/api/tasks/${taskId}/complete`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.status).toBe('done');
  });

  it('toggles completion back to false and sets status to in-progress', async () => {
    await request(app).patch(`/api/tasks/${taskId}/complete`).set(auth(token));
    const res = await request(app).patch(`/api/tasks/${taskId}/complete`).set(auth(token));
    expect(res.body.completed).toBe(false);
    expect(res.body.status).toBe('in-progress');
  });

  it('returns 404 for non-existent task id', async () => {
    const res = await request(app)
      .patch('/api/tasks/000000000000000000000000/complete')
      .set(auth(token));
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/tasks/:id', () => {
  let token: string;
  let taskId: string;

  beforeEach(async () => {
    token = await getToken();
    const res = await request(app).post('/api/tasks').set(auth(token)).send({ title: 'Editable', priority: 'Low' });
    taskId = res.body._id;
  });

  it('updates title and priority', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set(auth(token))
      .send({ title: 'Updated Title', priority: 'High' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
    expect(res.body.priority).toBe('High');
  });

  it('updates status to in-progress and syncs completed', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set(auth(token))
      .send({ status: 'in-progress' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in-progress');
    expect(res.body.completed).toBe(false);
  });

  it('returns 404 when task not found', async () => {
    const res = await request(app)
      .patch('/api/tasks/000000000000000000000000')
      .set(auth(token))
      .send({ title: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  let token: string;
  let taskId: string;

  beforeEach(async () => {
    token = await getToken();
    const res = await request(app).post('/api/tasks').set(auth(token)).send({ title: 'Delete me', priority: 'Low' });
    taskId = res.body._id;
  });

  it('deletes a task and returns 200', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted');
  });

  it('returns 404 when deleting a non-existent task', async () => {
    const res = await request(app)
      .delete('/api/tasks/000000000000000000000000')
      .set(auth(token));
    expect(res.status).toBe(404);
  });
});

describe('GET /api/tasks/analytics', () => {
  it('returns correct analytics totals per user', async () => {
    const token = await getToken();
    await request(app).post('/api/tasks').set(auth(token)).send({ title: 'T1', priority: 'High' });
    await request(app).post('/api/tasks').set(auth(token)).send({ title: 'T2', priority: 'Low' });

    // Complete one task
    const listRes = await request(app).get('/api/tasks').set(auth(token));
    const firstId = listRes.body.tasks[0]._id;
    await request(app).patch(`/api/tasks/${firstId}/complete`).set(auth(token));

    const res = await request(app).get('/api/tasks/analytics').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.completed).toBe(1);
    expect(res.body.pending).toBe(1);
    expect(res.body).toHaveProperty('byPriority');
    expect(res.body).toHaveProperty('byStatus');
    expect(res.body).toHaveProperty('thisWeek');
    expect(res.body).toHaveProperty('sortedByPriority');
  });
});
