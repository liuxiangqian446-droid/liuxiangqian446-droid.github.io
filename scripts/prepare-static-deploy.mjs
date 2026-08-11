import { cp, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')

await mkdir(dist, { recursive: true })
await cp(resolve(root, 'standalone.html'), resolve(dist, 'standalone.html'))
await rm(resolve(dist, 'assets'), { recursive: true, force: true })
await cp(resolve(root, 'assets'), resolve(dist, 'assets'), { recursive: true })
