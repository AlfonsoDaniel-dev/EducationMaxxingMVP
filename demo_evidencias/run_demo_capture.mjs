import playwright from '/private/tmp/node_modules/playwright-core/index.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const { chromium } = playwright;
const ROOT = '/Users/alfonsocr/Documents/programacion/uni/EducationMaxxingMVP';
const OUT = path.join(ROOT, 'demo_evidencias');
const FRONTEND = 'http://localhost:3000';
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
  description: 'Subir un archivo válido para demostrar el flujo principal de entregas del MVP.',
};

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

async function login(page, email, password) {
  await page.goto(`${FRONTEND}/login`, { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() => window.location.pathname === '/dashboard', null, { timeout: 15000 });
  await page.getByText('EducationMaxxing').first().waitFor({ state: 'visible', timeout: 15000 });
}

async function logout(page) {
  await page.getByRole('button', { name: /Sign out/i }).click();
  await page.waitForURL('**/login', { timeout: 15000 });
}

async function createProfessor(page) {
  await page.goto(`${FRONTEND}/users`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '+ Register Professor' }).click();
  await page.getByPlaceholder('Jane Doe').fill(professor.name);
  await page.getByPlaceholder('jane@university.edu').fill(professor.email);
  await page.getByPlaceholder('Min. 8 characters').fill(professor.password);
  await page.getByRole('button', { name: 'Register Professor' }).click();
  await page.getByText('Professor registered successfully!').waitFor({ state: 'visible', timeout: 15000 });
}

async function createStudent(page) {
  await page.getByRole('button', { name: '+ Register Student' }).click();
  await page.getByPlaceholder('Jane Doe').fill(student.name);
  await page.getByPlaceholder('jane@university.edu').fill(student.email);
  await page.getByPlaceholder('Min. 8 characters').fill(student.password);
  await page.getByPlaceholder('A12345678').fill(student.enrollmentId);
  await page.getByRole('button', { name: 'Register Student' }).click();
  await page.getByText('Student registered successfully!').waitFor({ state: 'visible', timeout: 15000 });
}

async function createCourseAsAdmin(page) {
  await page.goto(`${FRONTEND}/courses`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '+ Create Course' }).click();
  await page.getByPlaceholder('e.g. Data Structures').fill(course.name);
  await page.getByPlaceholder('e.g. 2026-1').fill(course.period);
  await page.getByPlaceholder('Brief description…').fill(course.description);
  await page.locator('select').selectOption({ label: `${professor.name} — ${professor.email}` });
  await page.getByRole('button', { name: 'Create & Assign' }).click();
  await page.getByText(course.name).waitFor({ state: 'visible', timeout: 15000 });
}

async function enrollStudent(page) {
  await page.goto(`${FRONTEND}/users`, { waitUntil: 'domcontentloaded' });
  const enrollmentForm = page.locator('form').filter({ hasText: 'Enroll Student' });
  await enrollmentForm.locator('select').nth(0).selectOption({ label: student.name });
  await enrollmentForm.locator('select').nth(1).selectOption({ label: `${course.name} (${course.period})` });
  await page.getByRole('button', { name: 'Enroll Student' }).click();
  await page.getByText('Student enrolled successfully!').waitFor({ state: 'visible', timeout: 15000 });
}

async function createAssignmentAsProfessor(page) {
  await page.goto(`${FRONTEND}/courses`, { waitUntil: 'domcontentloaded' });
  await page.getByText(course.name).click();
  await page.waitForURL('**/courses/**', { timeout: 15000 });
  await page.getByRole('button', { name: '+ New Assignment' }).click();
  await page.getByPlaceholder('e.g. Lab Report 1').fill(assignment.title);
  await page.getByPlaceholder('Instructions, requirements…').fill(assignment.description);
  await page.locator('input[type="datetime-local"]').nth(0).fill(localDateTime(1));
  await page.locator('input[type="datetime-local"]').nth(1).fill(localDateTime(72));
  await page.getByRole('button', { name: 'Create Assignment' }).click();
  await page.getByText(assignment.title).waitFor({ state: 'visible', timeout: 15000 });
}

async function testStudentSubmission(page) {
  await page.goto(`${FRONTEND}/courses`, { waitUntil: 'domcontentloaded' });
  await page.getByText(course.name).click();
  await page.getByText(assignment.title).click();
  await page.waitForURL('**/assignments/**', { timeout: 15000 });

  const invalidPath = path.join(OUT, 'archivo_invalido.exe');
  const validPath = path.join(OUT, 'entrega_valida.txt');
  await fs.writeFile(invalidPath, 'contenido no permitido para validar manejo de error');
  await fs.writeFile(validPath, 'Entrega valida generada durante el demo del MVP.');

  const input = page.locator('input[type="file"]');
  await input.setInputFiles(invalidPath);
  await page.getByRole('button', { name: 'Submit 1 file' }).click();
  await page.getByText('file type is not allowed').waitFor({ state: 'visible', timeout: 15000 });
  const errorShot = await screenshot(page, '03_error_archivo_invalido.png');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await input.setInputFiles(validPath);
  await page.getByRole('button', { name: 'Submit 1 file' }).click();
  await page.getByText('Submitted! Confirmation:').waitFor({ state: 'visible', timeout: 15000 });
  const successShot = await screenshot(page, '02_entrega_exitosa.png');

  return { errorShot, successShot };
}

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox'],
});

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(15000);

try {
  console.log('1 login admin');
  await login(page, 'admin@educationmaxxing.com', 'admin1234');
  console.log('2 screenshot dashboard');
  const dashboardShot = await screenshot(page, '01_inicio_dashboard_admin.png');
  console.log('3 create professor');
  await createProfessor(page);
  console.log('4 create student');
  await createStudent(page);
  console.log('5 create course as admin');
  await createCourseAsAdmin(page);
  console.log('6 enroll student');
  await enrollStudent(page);
  console.log('7 logout admin');
  await logout(page);

  console.log('8 login professor');
  await login(page, professor.email, professor.password);
  console.log('9 create assignment');
  await createAssignmentAsProfessor(page);
  console.log('10 logout professor');
  await logout(page);

  console.log('11 login student');
  await login(page, student.email, student.password);
  console.log('12 test submission');
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
  console.log(JSON.stringify({ professor, student, course, assignment }, null, 2));
} finally {
  await browser.close();
}
