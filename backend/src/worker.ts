import { z } from 'zod';

interface D1Result<T = Record<string, unknown>> {
  results: T[];
  meta: { changes: number };
}

interface D1Statement {
  bind(...values: (string | number | null | ArrayBuffer)[]): D1Statement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(query: string): D1Statement;
}

interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  DB: D1Database;
  ASSETS: AssetsBinding;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
}

interface UserRow {
  id: string;
  email: string;
  role: string;
}

interface SessionRow {
  id: string;
  expiresAt: string;
  userId: string;
  email: string;
  role: string;
}

type SqlValue = string | number | null | ArrayBuffer;
type DataObject = Record<string, unknown>;
type TableDefinition = { table: string; fields: string[]; hasUpdatedAt?: boolean };

const SESSION_COOKIE = 'portfolio_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_EMAIL = 'sofia.arbelaez.mejia@gmail.com';

const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  headline: z.string().trim().min(1).max(180),
  bio: z.string().trim().max(5000),
  location: z.string().trim().max(120).nullable().optional(),
  email: z.string().email().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

const projectSchema = z.object({
  title: z.string().trim().min(1).max(160),
  type: z.string().trim().min(1).max(80),
  description: z.string().trim().max(5000),
  stack: z.string().trim().max(1000),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

const certificateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  categoryGroup: z.string().trim().min(1).max(100).default('Professional & Productivity'),
  category: z.string().trim().min(1).max(120),
  issuer: z.string().trim().max(160).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  issuedAt: z.coerce.date().nullable().optional(),
  durationMinutes: z.number().int().positive().max(100000).nullable().optional(),
  url: z.union([z.string().url(), z.string().regex(/^\/uploads\/[\w./-]+$/)]).nullable().optional(),
});

const experienceSchema = z.object({
  title: z.string().trim().min(1).max(160),
  company: z.string().trim().max(160).nullable().optional(),
  location: z.string().trim().max(160).nullable().optional(),
  description: z.string().trim().max(5000),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  current: z.boolean().default(false),
});

const educationSchema = z.object({
  institution: z.string().trim().min(1).max(180),
  degree: z.string().trim().min(1).max(180),
  field: z.string().trim().max(180).nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
});

const skillSchema = z.object({ name: z.string().trim().min(1).max(120), groupId: z.string().min(1) });
const groupSchema = z.object({ name: z.string().trim().min(1).max(120), order: z.number().int().default(0) });
const availabilityFields = z.object({
  title: z.string().trim().min(1).max(120),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  timezone: z.string().trim().min(1).max(80),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  notes: z.string().trim().max(500).nullable().optional(),
});
const availabilitySchema = availabilityFields.superRefine((value, context) => {
  if (value.startTime >= value.endTime) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['endTime'], message: 'End time must be later than start time' });
  }
});
const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email(),
  subject: z.string().trim().max(180).nullable().optional(),
  company: z.string().trim().max(160).nullable().optional(),
  opportunityType: z.string().trim().max(120).nullable().optional(),
  message: z.string().trim().min(1).max(5000),
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

const tables = {
  projects: { table: 'projects', schema: projectSchema, fields: ['title', 'type', 'description', 'stack', 'featured', 'published'] },
  certificates: { table: 'certificates', schema: certificateSchema, fields: ['title', 'categoryGroup', 'category', 'issuer', 'description', 'issuedAt', 'durationMinutes', 'url'] },
  experience: { table: 'experiences', schema: experienceSchema, fields: ['title', 'company', 'location', 'description', 'startDate', 'endDate', 'current'] },
  education: { table: 'educations', schema: educationSchema, fields: ['institution', 'degree', 'field', 'startDate', 'endDate', 'description'] },
  'skill-groups': { table: 'skill_groups', schema: groupSchema, fields: ['name', 'order'] },
  skills: { table: 'skills', schema: skillSchema, fields: ['name', 'groupId'] },
} satisfies Record<string, { table: string; schema: z.AnyZodObject; fields: string[] }>;

const booleanFields = new Set(['featured', 'published', 'current']);

function json(data: unknown, status = 200, headers?: HeadersInit): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { status, headers: responseHeaders });
}

function sql(db: D1Database, query: string, values: SqlValue[] = []): D1Statement {
  const statement = db.prepare(query);
  return values.length ? statement.bind(...values) : statement;
}

function toSqlValue(value: unknown): SqlValue {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string' || typeof value === 'number' || value === null || value instanceof ArrayBuffer) return value;
  throw new Error('Unsupported database value');
}

function cookies(request: Request): Map<string, string> {
  const result = new Map<string, string>();
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const separator = part.indexOf('=');
    if (separator > 0) result.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
  }
  return result;
}

function cookie(token: string, maxAge = SESSION_TTL_SECONDS): string {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function passwordHash(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const saltCopy = new Uint8Array(salt.byteLength);
  saltCopy.set(salt);
  const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: saltCopy, iterations: 310000 }, key, 256);
  return new Uint8Array(derived);
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, iterationsValue, saltValue, hashValue] = stored.split('$');
  if (algorithm !== 'pbkdf2' || iterationsValue !== '310000' || !saltValue || !hashValue) return false;
  const actual = await passwordHash(password, fromBase64(saltValue));
  const expected = fromBase64(hashValue);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index];
  return difference === 0;
}

async function makePasswordHash(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$310000$${toBase64(salt)}$${toBase64(await passwordHash(password, salt))}`;
}

async function sessionFor(request: Request, env: Env): Promise<SessionRow | null> {
  const token = cookies(request).get(SESSION_COOKIE);
  if (!token) return null;
  const session = await sql(env.DB, `SELECT s.id, s.expiresAt, u.id AS userId, u.email, u.role
    FROM sessions s JOIN users u ON u.id = s.userId WHERE s.tokenHash = ?`, [await sha256(token)])
    .first<SessionRow>();
  if (!session) return null;
  if (Date.parse(session.expiresAt) <= Date.now()) {
    await sql(env.DB, 'DELETE FROM sessions WHERE id = ?', [session.id]).run();
    return null;
  }
  return session;
}

async function requireAdmin(request: Request, env: Env): Promise<SessionRow | Response> {
  const session = await sessionFor(request, env);
  return session?.role === 'ADMIN' ? session : json({ message: 'Authentication required' }, 401);
}

async function readJson(request: Request): Promise<{ value: unknown } | { response: Response }> {
  try {
    return { value: await request.json() };
  } catch {
    return { response: json({ message: 'Invalid JSON body' }, 400) };
  }
}

function id(): string {
  return crypto.randomUUID();
}

function toClientRow(row: DataObject): DataObject {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, booleanFields.has(key) ? Boolean(value) : value]));
}

async function createRow(env: Env, config: TableDefinition, data: DataObject): Promise<DataObject> {
  const columns = config.fields.filter((field) => data[field] !== undefined);
  const now = new Date().toISOString();
  const names = ['id', ...columns, 'createdAt'];
  const values = [id(), ...columns.map((field) => toSqlValue(data[field])), now];
  if (config.hasUpdatedAt !== false) {
    names.push('updatedAt');
    values.push(now);
  }
  await sql(env.DB, `INSERT INTO "${config.table}" (${names.map((name) => `"${name}"`).join(', ')})
    VALUES (${names.map(() => '?').join(', ')})`, values).run();
  return (await sql(env.DB, `SELECT * FROM "${config.table}" WHERE id = ?`, [values[0] as string]).first<DataObject>())!;
}

async function updateRow(env: Env, config: TableDefinition, rowId: string, data: DataObject): Promise<DataObject | null> {
  const columns = config.fields.filter((field) => data[field] !== undefined);
  const assignments = [...columns.map((field) => `"${field}" = ?`), '"updatedAt" = ?'];
  const values = [...columns.map((field) => toSqlValue(data[field])), new Date().toISOString(), rowId];
  const result = await sql(env.DB, `UPDATE "${config.table}" SET ${assignments.join(', ')} WHERE id = ?`, values).run();
  if (!result.meta.changes) return null;
  return sql(env.DB, `SELECT * FROM "${config.table}" WHERE id = ?`, [rowId]).first<DataObject>();
}

async function removeRow(env: Env, config: TableDefinition, rowId: string): Promise<boolean> {
  const result = await sql(env.DB, `DELETE FROM "${config.table}" WHERE id = ?`, [rowId]).run();
  return result.meta.changes > 0;
}

async function login(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if ('response' in body) return body.response;
  const parsed = loginSchema.safeParse(body.value);
  if (!parsed.success) return json({ message: 'Invalid credentials format' }, 400);
  const email = parsed.data.email.toLowerCase();
  let user = await sql(env.DB, 'SELECT id, email, password, role FROM users WHERE email = ?', [email])
    .first<UserRow & { password: string }>();

  if (!user) {
    const existing = await sql(env.DB, 'SELECT id FROM users LIMIT 1').first<{ id: string }>();
    const configuredEmail = (env.ADMIN_EMAIL ?? DEFAULT_EMAIL).toLowerCase();
    if (existing || email !== configuredEmail || !env.ADMIN_PASSWORD || parsed.data.password !== env.ADMIN_PASSWORD) {
      return json({ message: 'Invalid email or password' }, 401);
    }
    const newId = id();
    const now = new Date().toISOString();
    const hash = await makePasswordHash(parsed.data.password);
    await sql(env.DB, `INSERT INTO users (id, email, password, role, createdAt, updatedAt)
      VALUES (?, ?, ?, 'ADMIN', ?, ?)`, [newId, email, hash, now, now]).run();
    user = { id: newId, email, password: hash, role: 'ADMIN' };
  }

  if (user.role !== 'ADMIN' || !(await verifyPassword(parsed.data.password, user.password))) {
    return json({ message: 'Invalid email or password' }, 401);
  }

  const token = toBase64(crypto.getRandomValues(new Uint8Array(32))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  const now = new Date();
  await sql(env.DB, 'INSERT INTO sessions (id, tokenHash, userId, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?)', [
    id(), await sha256(token), user.id, new Date(now.getTime() + SESSION_TTL_SECONDS * 1000).toISOString(), now.toISOString(),
  ]).run();
  return json({ user: { id: user.id, email: user.email, role: user.role } }, 200, { 'Set-Cookie': cookie(token) });
}

async function handleAuth(request: Request, env: Env, path: string): Promise<Response> {
  if (path === '/api/auth/login' && request.method === 'POST') return login(request, env);
  if (path === '/api/auth/forgot-password' && request.method === 'POST') {
    const body = await readJson(request);
    if ('response' in body) return body.response;
    const parsed = z.object({ email: z.string().email() }).safeParse(body.value);
    if (!parsed.success) return json({ message: 'Enter a valid email address' }, 400);
    return json({ message: 'If that account exists, recovery instructions have been sent.' });
  }
  if (path === '/api/auth/google' && request.method === 'GET') {
    return json({ message: 'Google sign-in is not configured. Add Google OAuth credentials to the Cloudflare Worker environment first.' }, 503);
  }
  if (path === '/api/auth/logout' && request.method === 'POST') {
    const token = cookies(request).get(SESSION_COOKIE);
    if (token) await sql(env.DB, 'DELETE FROM sessions WHERE tokenHash = ?', [await sha256(token)]).run();
    return new Response(null, { status: 204, headers: { 'Set-Cookie': cookie('', 0) } });
  }
  if (path === '/api/auth/me' && request.method === 'GET') {
    const session = await sessionFor(request, env);
    if (!session || session.role !== 'ADMIN') return json({ message: 'Authentication required' }, 401);
    return json({ user: { id: session.userId, email: session.email, role: session.role } });
  }
  return json({ message: 'Not found' }, 404);
}

const defaultProfile = {
  fullName: 'Sofía Arbeláez Mejía',
  headline: 'Data Science Student | Computer Engineering',
  bio: '',
  location: null,
  email: DEFAULT_EMAIL,
  linkedinUrl: null,
  githubUrl: null,
  avatarUrl: null,
};

async function handleProfile(request: Request, env: Env, path: string): Promise<Response> {
  if (path === '/api/profile/public' && request.method === 'GET') {
    const profile = await sql(env.DB, 'SELECT fullName, headline, bio, location, email, linkedinUrl, githubUrl, avatarUrl FROM profiles LIMIT 1')
      .first<DataObject>();
    return json({ profile: profile ?? defaultProfile });
  }
  if (path !== '/api/profile' || !['GET', 'PATCH'].includes(request.method)) return json({ message: 'Not found' }, 404);
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  if (request.method === 'GET') {
    const profile = await sql(env.DB, 'SELECT * FROM profiles LIMIT 1').first<DataObject>();
    return json({ profile: profile ?? defaultProfile });
  }

  const body = await readJson(request);
  if ('response' in body) return body.response;
  const parsed = profileSchema.safeParse(body.value);
  if (!parsed.success) return json({ message: 'Invalid profile data', issues: parsed.error.flatten() }, 400);
  const existing = await sql(env.DB, 'SELECT id FROM profiles LIMIT 1').first<{ id: string }>();
  if (existing) {
    const updates = Object.entries(parsed.data).map(([key, value]) => `"${key}" = ?`);
    const values = Object.values(parsed.data).map(toSqlValue);
    await sql(env.DB, `UPDATE profiles SET ${[...updates, '"updatedAt" = ?'].join(', ')} WHERE id = ?`,
      [...values, new Date().toISOString(), existing.id]).run();
    return json({ profile: await sql(env.DB, 'SELECT * FROM profiles WHERE id = ?', [existing.id]).first<DataObject>() });
  }
  const now = new Date().toISOString();
  const fields = Object.keys(parsed.data);
  const values = [id(), ...fields.map((field) => toSqlValue(parsed.data[field as keyof typeof parsed.data])), now, now];
  await sql(env.DB, `INSERT INTO profiles (id, ${fields.map((field) => `"${field}"`).join(', ')}, createdAt, updatedAt)
    VALUES (${values.map(() => '?').join(', ')})`, values).run();
  return json({ profile: await sql(env.DB, 'SELECT * FROM profiles WHERE id = ?', [values[0] as string]).first<DataObject>() });
}

async function handleContent(request: Request, env: Env, parts: string[], url: URL): Promise<Response> {
  if (parts[0] === 'certificates' && parts[1] === 'upload' && request.method === 'POST') {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.type !== 'application/pdf' || file.size > 1024 * 1024) {
      return json({ message: 'A PDF certificate file under 1 MB is required.' }, 400);
    }
    const bytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (new TextDecoder().decode(bytes) !== '%PDF-') return json({ message: 'The uploaded file is not a valid PDF.' }, 400);
    const key = `certificates/${crypto.randomUUID()}.pdf`;
    await sql(env.DB, `INSERT INTO certificate_files (key, contentType, data, createdAt)
      VALUES (?, 'application/pdf', ?, ?)`, [key, await file.arrayBuffer(), new Date().toISOString()]).run();
    return json({ url: `/uploads/${key}` }, 201);
  }

  const [collection, rowId] = parts;
  const config = tables[collection as keyof typeof tables];
  if (!config) return json({ message: 'Not found' }, 404);
  const isAdminQuery = url.searchParams.get('admin') === 'true';
  if (request.method === 'GET' && rowId === undefined) {
    if (isAdminQuery) {
      const admin = await requireAdmin(request, env);
      if (admin instanceof Response) return admin;
    }
    let rows: DataObject[];
    if (collection === 'skill-groups') {
      rows = (await sql(env.DB, `SELECT g.*, s.id AS skill_id, s.name AS skill_name, s.groupId AS skill_groupId,
        s.createdAt AS skill_createdAt, s.updatedAt AS skill_updatedAt
        FROM skill_groups g LEFT JOIN skills s ON s.groupId = g.id ORDER BY g."order" ASC, s.createdAt DESC`).all<DataObject>()).results;
      const groups = new Map<string, DataObject>();
      for (const row of rows) {
        const groupId = String(row.id);
        if (!groups.has(groupId)) groups.set(groupId, { id: row.id, name: row.name, order: row.order, createdAt: row.createdAt, updatedAt: row.updatedAt, skills: [] });
        if (row.skill_id) (groups.get(groupId)!.skills as DataObject[]).push(toClientRow({
          id: row.skill_id, name: row.skill_name, groupId: row.skill_groupId, createdAt: row.skill_createdAt, updatedAt: row.skill_updatedAt,
        }));
      }
      return json({ items: [...groups.values()] });
    }
    const condition = collection === 'projects' && !isAdminQuery ? ' WHERE published = 1' : '';
    rows = (await sql(env.DB, `SELECT * FROM "${config.table}"${condition} ORDER BY createdAt DESC`).all<DataObject>()).results;
    return json({ items: rows.map(toClientRow) });
  }
  if (request.method === 'POST' && rowId === undefined) {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;
    const body = await readJson(request);
    if ('response' in body) return body.response;
    const parsed = config.schema.safeParse(body.value);
    if (!parsed.success) return json({ message: `Invalid ${collection} data`, issues: parsed.error.flatten() }, 400);
    return json({ item: toClientRow(await createRow(env, config, parsed.data)) }, 201);
  }
  if (request.method === 'PATCH' && rowId) {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;
    const body = await readJson(request);
    if ('response' in body) return body.response;
    const parsed = config.schema.partial().safeParse(body.value);
    if (!parsed.success) return json({ message: `Invalid ${collection} data`, issues: parsed.error.flatten() }, 400);
    const updated = await updateRow(env, config, rowId, parsed.data);
    return updated ? json({ item: toClientRow(updated) }) : json({ message: `${collection} item not found` }, 404);
  }
  if (request.method === 'DELETE' && rowId) {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;
    return (await removeRow(env, config, rowId)) ? new Response(null, { status: 204 }) : json({ message: `${collection} item not found` }, 404);
  }
  return json({ message: 'Not found' }, 404);
}

async function handleAvailability(request: Request, env: Env, parts: string[]): Promise<Response> {
  if (parts.length === 0 && request.method === 'GET') {
    const windows = (await sql(env.DB, `SELECT * FROM availability_windows WHERE status = 'ACTIVE'
      ORDER BY dayOfWeek ASC, startTime ASC`).all<DataObject>()).results;
    return json({ windows });
  }
  if (parts[0] === 'admin' && request.method === 'GET') {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;
    const windows = (await sql(env.DB, 'SELECT * FROM availability_windows ORDER BY dayOfWeek ASC, startTime ASC').all<DataObject>()).results;
    return json({ windows });
  }
  if (parts.length === 0 && request.method === 'POST') {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;
    const body = await readJson(request);
    if ('response' in body) return body.response;
    const parsed = availabilitySchema.safeParse(body.value);
    if (!parsed.success) return json({ message: 'Invalid availability window', issues: parsed.error.flatten() }, 400);
    return json({ window: await createRow(env, {
      table: 'availability_windows',
      fields: ['title', 'dayOfWeek', 'startTime', 'endTime', 'timezone', 'status', 'notes'],
    }, parsed.data) }, 201);
  }
  if (parts[0] && request.method === 'PATCH') {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;
    const body = await readJson(request);
    if ('response' in body) return body.response;
    const parsed = availabilityFields.partial().safeParse(body.value);
    if (!parsed.success) return json({ message: 'Invalid availability window', issues: parsed.error.flatten() }, 400);
    const current = await sql(env.DB, 'SELECT startTime, endTime FROM availability_windows WHERE id = ?', [parts[0]])
      .first<{ startTime: string; endTime: string }>();
    if (!current) return json({ message: 'Availability window not found' }, 404);
    if ((parsed.data.startTime ?? current.startTime) >= (parsed.data.endTime ?? current.endTime)) {
      return json({ message: 'End time must be later than start time' }, 400);
    }
    const updated = await updateRow(env, {
      table: 'availability_windows',
      fields: ['title', 'dayOfWeek', 'startTime', 'endTime', 'timezone', 'status', 'notes'],
    }, parts[0], parsed.data);
    return json({ window: updated });
  }
  if (parts[0] && request.method === 'DELETE') {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;
    const result = await sql(env.DB, 'DELETE FROM availability_windows WHERE id = ?', [parts[0]]).run();
    return result.meta.changes ? new Response(null, { status: 204 }) : json({ message: 'Availability window not found' }, 404);
  }
  return json({ message: 'Not found' }, 404);
}

async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  const { pathname } = url;
  if (pathname === '/api' && request.method === 'GET') return json({ message: 'Portfolio API is running', routes: ['/api/health'] });
  if (pathname === '/api/health' && request.method === 'GET') {
    return json({ ok: true, name: 'portfolio-backend', environment: 'production', timestamp: new Date().toISOString() });
  }
  if (pathname.startsWith('/api/auth/')) return handleAuth(request, env, pathname);
  if (pathname === '/api/profile' || pathname === '/api/profile/public') return handleProfile(request, env, pathname);
  if (pathname.startsWith('/api/content/')) return handleContent(request, env, pathname.slice('/api/content/'.length).split('/'), url);
  if (pathname === '/api/contact' && request.method === 'POST') {
    const body = await readJson(request);
    if ('response' in body) return body.response;
    const parsed = contactSchema.safeParse(body.value);
    if (!parsed.success) return json({ message: 'Please complete the required fields.', issues: parsed.error.flatten() }, 400);
    const { opportunityType: _opportunityType, ...data } = parsed.data;
    const created = await createRow(env, {
      table: 'contact_messages',
      fields: ['name', 'email', 'subject', 'company', 'message'],
      hasUpdatedAt: false,
    }, data);
    return json({ message: 'Your message has been sent.', id: created.id }, 201);
  }
  if (pathname === '/api/availability' || pathname.startsWith('/api/availability/')) {
    return handleAvailability(request, env, pathname.slice('/api/availability'.length).split('/').filter(Boolean));
  }
  return json({ message: 'Not found' }, 404);
}

async function serveUpload(request: Request, env: Env, pathname: string): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return json({ message: 'Method not allowed' }, 405);
  let key: string;
  try {
    key = decodeURIComponent(pathname.slice('/uploads/'.length));
  } catch {
    return json({ message: 'Invalid upload path' }, 400);
  }
  if (!key || key.split('/').some((part) => !part || part === '.' || part === '..')) return json({ message: 'Not found' }, 404);
  const file = await sql(env.DB, 'SELECT contentType, data FROM certificate_files WHERE key = ?', [key])
    .first<{ contentType: string; data: ArrayBuffer | Uint8Array }>();
  if (!file) return json({ message: 'Not found' }, 404);
  const headers = new Headers({
    'Content-Type': file.contentType,
    'Cache-Control': 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
  });
  const body = file.data instanceof ArrayBuffer ? file.data : new Uint8Array(file.data);
  headers.set('Content-Length', String(body.byteLength));
  return new Response(request.method === 'HEAD' ? null : body, { headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith('/api/')) return await handleApi(request, env, url);
      if (url.pathname === '/api') return await handleApi(request, env, url);
      if (url.pathname.startsWith('/uploads/')) return await serveUpload(request, env, url.pathname);
      return await env.ASSETS.fetch(request);
    } catch (error) {
      console.error('Cloudflare Worker request failed', error);
      return json({ message: 'Internal server error' }, 500);
    }
  },
};
