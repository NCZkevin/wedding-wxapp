interface MapLocation {
  name: string
  latitude: number
  longitude: number
}

export function openMap(location: MapLocation) {
  const params = new URLSearchParams({
    position: `${location.longitude},${location.latitude}`,
    name: location.name,
    src: 'wedding.nczkevin.com',
    coordinate: 'gaode',
    callnative: '1',
  })
  window.open(`https://uri.amap.com/marker?${params}`, '_blank', 'noopener,noreferrer')
}

export function getOrCreateClientId(key: string) {
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const clientId = crypto.randomUUID()
  localStorage.setItem(key, clientId)
  return clientId
}

export async function sharePage(data: ShareData) {
  if (navigator.share) {
    await navigator.share(data)
    return 'shared'
  }
  await navigator.clipboard.writeText(data.url || window.location.href)
  return 'copied'
}

export async function compressImage(file: File, maxEdge = 1800, quality = 0.84) {
  if (
    !file.type.startsWith('image/') ||
    file.size < 900 * 1024 ||
    typeof createImageBitmap !== 'function'
  ) {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * ratio)
  canvas.height = Math.round(bitmap.height * ratio)

  const context = canvas.getContext('2d')
  if (!context) return file
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob || blob.size >= file.size) return file
  return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  })
}
