import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit', shell: true })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))
    })
  })
}

function start(args) {
  const child = spawn('npm', args, { cwd: root, stdio: 'inherit', shell: true })
  child.on('exit', (code) => {
    if (code && code !== 0) process.exitCode = code
  })
  return child
}

await run('npm', ['run', 'build', '-w', '@msh/shared'])
const children = [
  start(['run', 'dev:shared']),
  start(['run', 'dev:api']),
  start(['run', 'dev:web']),
]

function shutdown() {
  for (const child of children) child.kill()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
