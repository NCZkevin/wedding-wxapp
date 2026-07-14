const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const config = JSON.parse(fs.readFileSync(path.join(root, 'project.config.json'), 'utf8'))
const ignores = Array.isArray(config.packOptions && config.packOptions.ignore)
  ? config.packOptions.ignore
  : []

const normalizedIgnores = ignores
  .filter((entry) => entry && typeof entry === 'object')
  .map((entry) => ({
    type: entry.type,
    value: String(entry.value || '').replace(/^\.\//, '').replace(/\/$/, ''),
  }))

function isIgnored(relativePath, isDirectory) {
  if (relativePath === '.git' || relativePath.startsWith('.git/')) return true

  return normalizedIgnores.some((entry) => {
    if (entry.type === 'file') return !isDirectory && relativePath === entry.value
    if (entry.type === 'folder') {
      return relativePath === entry.value || relativePath.startsWith(`${entry.value}/`)
    }
    return false
  })
}

function collectFiles(directory, relativeDirectory = '') {
  const files = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relativePath = path.posix.join(relativeDirectory, entry.name)
    if (isIgnored(relativePath, entry.isDirectory())) continue

    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...collectFiles(absolutePath, relativePath))
    if (entry.isFile()) files.push({ path: relativePath, size: fs.statSync(absolutePath).size })
  }

  return files
}

const files = collectFiles(root)
const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
const maxBytes = 2 * 1024 * 1024

console.log(`Package source size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`)
console.log(`Included files: ${files.length}`)

if (totalBytes > maxBytes) {
  console.error(`Package exceeds WeChat's 2 MB main-package limit by ${((totalBytes - maxBytes) / 1024 / 1024).toFixed(2)} MB.`)
  process.exit(1)
}

console.log(`Remaining budget: ${((maxBytes - totalBytes) / 1024 / 1024).toFixed(2)} MB`)
