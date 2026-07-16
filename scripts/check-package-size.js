const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const config = JSON.parse(fs.readFileSync(path.join(root, 'project.config.json'), 'utf8'))
const appConfig = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
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
const maxBytes = 2 * 1024 * 1024
const subpackages = (appConfig.subpackages || appConfig.subPackages || []).map((subpackage) => ({
  name: subpackage.name || subpackage.root,
  root: String(subpackage.root || '').replace(/^\//, '').replace(/\/$/, ''),
}))

function packageSize(packageFiles) {
  return packageFiles.reduce((sum, file) => sum + file.size, 0)
}

function reportPackage(name, packageFiles) {
  const totalBytes = packageSize(packageFiles)
  console.log(`${name}: ${(totalBytes / 1024 / 1024).toFixed(2)} MB (${packageFiles.length} files)`)

  if (totalBytes > maxBytes) {
    console.error(`${name} exceeds the 2 MB package limit by ${((totalBytes - maxBytes) / 1024 / 1024).toFixed(2)} MB.`)
    return false
  }

  console.log(`${name} remaining budget: ${((maxBytes - totalBytes) / 1024 / 1024).toFixed(2)} MB`)
  return true
}

const mainFiles = files.filter((file) => !subpackages.some((subpackage) => (
  file.path === subpackage.root || file.path.startsWith(`${subpackage.root}/`)
)))

let valid = reportPackage('Main package', mainFiles)

for (const subpackage of subpackages) {
  const subpackageFiles = files.filter((file) => (
    file.path === subpackage.root || file.path.startsWith(`${subpackage.root}/`)
  ))
  valid = reportPackage(`Subpackage ${subpackage.name}`, subpackageFiles) && valid
}

if (!valid) {
  process.exit(1)
}
