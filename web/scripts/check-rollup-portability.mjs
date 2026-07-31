import { readFile } from 'node:fs/promises'

const packageUrl = new URL('../node_modules/rollup/package.json', import.meta.url)
const packageJson = JSON.parse(await readFile(packageUrl, 'utf8'))

if (packageJson.name !== '@rollup/wasm-node') {
  throw new Error(
    `Expected the portable @rollup/wasm-node build, but resolved ${packageJson.name}@${packageJson.version}`,
  )
}

console.log(`Portable Rollup runtime verified: ${packageJson.name}@${packageJson.version}`)
