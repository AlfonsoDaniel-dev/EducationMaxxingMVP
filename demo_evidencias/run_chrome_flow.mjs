import playwright from '/private/tmp/node_modules/playwright-core/index.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const { chromium } = playwright;
const ROOT = '/Users/alfonsocr/Documents/programacion/uni/EducationMaxxingMVP';
const OUT = path.join(ROOT, 'demo_evidencias');
const FRONTEND = 'http://localhost:3000';
const API = 'http://localhost:8080/api';
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const stamp = Date.now();
const professor = {
  name: 'Profesor Demo MVP',
  email: `profesor.demo.${stamp}@university.edu`,
  password: 'profesor123',
};
const student = {
  name: 'Alumno Demo MVP',
  email: `alumno.demo.${stamp}@university.edu`,
  password: 'alumno1234',
  enrollmentId: `ALU${String(stamp).slice(-6)}`,
};
const course = {
  name: `Arquitectura MVP ${String(stamp).slice(-5)}`,
  period: '2026-2',
  description: 'Curso creado durante el demo para validar usuarios, cursos, asignaciones y entregas.',
};
const assignment = {
  title: `Entrega Demo ${String(stamp).slice(-5)}`,
  description: 'Subir un archivo valido para demostrar el flujo principal de entregas del MVP.',
};

async function apiGet(page, pathName) {
  return page.evaluate(async ({ apiBase, pathName }) => {
    const token = localStorage.getItem('em_token');
    const res = await fetch(`${apiBase}${pathName}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return res.json();
  }, { apiBase: API, pathName });
}

function localDateTime(offsetHours) {
  const d = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function screenshot(page, filename) {
  const file = path.join(OUT, filename);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function waitForApi() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@educationmaxxing.com', password: 'admin1234' }),
  });
  if (!res.ok) throw new Error(`Backend login probe failed: ${res.status}`);
}

async function login(page, email, password) {
  console.log(`login ${email}`);
  await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle' });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() => window.location.pathname === '/dashboard', null, { timeout: 20000 });
}

async function logout(page) {
  console.log('logout');
  await page.getByRole('button', { name: /Sign out/i }).click({ force: true }).catch(() => {});
  await page.waitForTimeout(1000);
  if (!page.url().includes('/login')) {
    await page.evaluate(() => {
      localStorage.removeItem('em_token');
      localStorage.removeItem('em_user');
    });
    await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle' });
  }
  await page.waitForFunction(() => window.location.pathname === '/login', null, { timeout: 20000 });
}

async function createProfessor(page) {
  console.log('create professor');
  await page.goto(`${FRONTEND}/users`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '+ Register Professor' }).click();
  await page.getByPlaceholder('Jane Doe').fill(professor.name);
  await page.getByPlaceholder('jane@university.edu').fill(professor.email);
  await page.getByPlaceholder('Min. 8 characters').fill(professor.password);
  await page.getByRole('button', { name: 'Register Professor', exact: true }).click();
  await page.getByText('Professor registered successfully!').waitFor({ state: 'visible', timeout: 20000 });
}

async function createStudent(page) {
  console.log('create student');
  await page.getByRole('button', { name: '+ Register Student' }).click();
  await page.getByPlaceholder('Jane Doe').fill(student.name);
  await page.getByPlaceholder('jane@university.edu').fill(student.email);
  await page.getByPlaceholder('Min. 8 characters').fill(student.password);
  await page.getByPlaceholder('A12345678').fill(student.enrollmentId);
  await page.getByRole('button', { name: 'Register Student', exact: true }).click();
  await page.getByText('Student registered successfully!').waitFor({ state: 'visible', timeout: 20000 });
}

async function createCourseAsAdmin(page) {
  console.log('create course as admin');
  await page.goto(`${FRONTEND}/courses`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '+ Create Course' }).click();
  await page.getByPlaceholder('e.g. Data Structures').fill(course.name);
  await page.getByPlaceholder('e.g. 2026-1').fill(course.period);
  await page.getByPlaceholder('Brief description…').fill(course.description);
  await page.locator('select').selectOption({ label: `${professor.name} — ${professor.email}` });
  await page.getByRole('button', { name: 'Create & Assign' }).click();
  await page.getByText(course.name).waitFor({ state: 'visible', timeout: 20000 });
}

async function resolveAdminIds(page) {
  console.log('resolve ids');
  const [students, professors, courses] = await Promise.all([
    apiGet(page, '/admin/users?role=student'),
    apiGet(page, '/admin/users?role=professor'),
    apiGet(page, '/admin/courses'),
  ]);
  const foundStudent = students.find((u) => u.email === student.email);
  const foundProfessor = professors.find((u) => u.email === professor.email);
  const foundCourse = courses.find((c) => c.name === course.name && c.period === course.period);
  if (!foundStudent || !foundProfessor || !foundCourse) {
    throw new Error('Could not resolve demo IDs after UI creation');
  }
  student.id = foundStudent.id;
  professor.id = foundProfessor.id;
  course.id = foundCourse.id;
}

async function enrollStudent(page) {
  console.log('enroll student');
  await page.goto(`${FRONTEND}/users`, { waitUntil: 'networkidle' });
  const enrollmentForm = page.locator('form').filter({ hasText: 'Enroll Student' });
  await enrollmentForm.locator('select').nth(0).selectOption(student.id);
  await enrollmentForm.locator('select').nth(1).selectOption(course.id);
  await page.getByRole('button', { name: 'Enroll Student' }).click();
  await page.getByText('Student enrolled successfully!').waitFor({ state: 'visible', timeout: 20000 });
}

async function createAssignmentAsProfessor(page) {
  console.log('create assignment');
  await page.goto(`${FRONTEND}/courses`, { waitUntil: 'networkidle' });
  await page.getByText(course.name).click();
  await page.waitForFunction(() => window.location.pathname.startsWith('/courses/'), null, { timeout: 20000 });
  await page.getByRole('button', { name: '+ New Assignment' }).click();
  await page.getByPlaceholder('e.g. Lab Report 1').fill(assignment.title);
  await page.getByPlaceholder('Instructions, requirements…').fill(assignment.description);
  await page.locator('input[type="datetime-local"]').nth(0).fill(localDateTime(1));
  await page.locator('input[type="datetime-local"]').nth(1).fill(localDateTime(72));
  await page.getByRole('button', { name: 'Create Assignment' }).click();
  await page.getByText(assignment.title).waitFor({ state: 'visible', timeout: 20000 });
}

async function testStudentSubmission(page) {
  console.log('student submission');
  await page.goto(`${FRONTEND}/courses`, { waitUntil: 'networkidle' });
  await page.getByText(course.name).click();
  await page.getByText(assignment.title).click();
  await page.waitForFunction(() => window.location.pathname.includes('/assignments/'), null, { timeout: 20000 });

  const invalidPath = path.join(OUT, 'archivo_invalido.exe');
  const validPath = path.join(OUT, 'entrega_valida.txt');
  await fs.writeFile(invalidPath, 'contenido no permitido para validar manejo de error');
  await fs.writeFile(validPath, 'Entrega valida generada durante el demo del MVP.');

  const input = page.locator('input[type="file"]');
  await input.setInputFiles(invalidPath);
  await page.getByRole('button', { name: 'Submit 1 file' }).click();
  await page.getByText('file type is not allowed').waitFor({ state: 'visible', timeout: 20000 });
  const errorShot = await screenshot(page, '03_error_archivo_invalido.png');

  await page.reload({ waitUntil: 'networkidle' });
  await input.setInputFiles(validPath);
  await page.getByRole('button', { name: 'Submit 1 file' }).click();
  await page.getByText('Submitted! Confirmation:').waitFor({ state: 'visible', timeout: 20000 });
  const successShot = await screenshot(page, '02_entrega_exitosa.png');

  return { errorShot, successShot };
}

await fs.mkdir(OUT, { recursive: true });
await waitForApi();

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: false,
  slowMo: 80,
  args: ['--start-maximized'],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.setDefaultTimeout(20000);

page.on('pageerror', (err) => console.log(`pageerror: ${err.message}`));
page.on('response', (res) => {
  if (res.status() >= 400 && res.url().includes('/api/')) {
    console.log(`api ${res.status()} ${res.url()}`);
  }
});

try {
  await login(page, 'admin@educationmaxxing.com', 'admin1234');
  const dashboardShot = await screenshot(page, '01_inicio_dashboard_admin.png');
  await createProfessor(page);
  await createStudent(page);
  await createCourseAsAdmin(page);
  await resolveAdminIds(page);
  await enrollStudent(page);
  await logout(page);

  await login(page, professor.email, professor.password);
  await createAssignmentAsProfessor(page);
  await logout(page);

  await login(page, student.email, student.password);
  const { errorShot, successShot } = await testStudentSubmission(page);

  await fs.writeFile(path.join(OUT, 'demo_metadata.json'), JSON.stringify({
    professor,
    student,
    course,
    assignment,
    screenshots: {
      dashboard: dashboardShot,
      submissionSuccess: successShot,
      invalidFileError: errorShot,
    },
  }, null, 2));

  console.log('DEMO_OK');
} catch (err) {
  await screenshot(page, 'debug_failure.png').catch(() => {});
  throw err;
} finally {
  await page.waitForTimeout(1000);
  await browser.close();
}
