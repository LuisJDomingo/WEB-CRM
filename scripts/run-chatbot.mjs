import { spawn } from 'node:child_process';
import process from 'node:process';

const isWindows = process.platform === 'win32';
const candidates = isWindows ? ['py', 'python', 'python3'] : ['python3', 'python'];

function runProbe(command, args = []) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'ignore' });
    child.on('error', () => resolve(false));
    child.on('close', (code) => resolve(code === 0));
  });
}

async function findPython() {
  for (const cmd of candidates) {
    const ok = await runProbe(cmd, ['--version']);
    if (ok) return cmd;
  }
  return null;
}

const python = await findPython();

if (!python) {
  console.error('❌ No se encontró Python en PATH.');
  console.error('Instala Python 3.10+ y vuelve a ejecutar `npm run chatbot`.');
  process.exit(1);
}

const uvicornCheck = await runProbe(python, ['-m', 'uvicorn', '--version']);
if (!uvicornCheck) {
  console.error('❌ No se encontró el módulo `uvicorn` en tu entorno de Python.');
  console.error('Ejecuta:');
  console.error('   cd agente_de_reservas');
  console.error(`   ${python} -m pip install -r requirements.txt`);
  process.exit(1);
}

const uvicorn = spawn(
  python,
  ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000'],
  {
    cwd: 'agente_de_reservas',
    stdio: 'inherit',
  },
);

uvicorn.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
