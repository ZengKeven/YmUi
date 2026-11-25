import { acceptsFile } from '../upload/request'

const imageTypes: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', jfif: 'image/jpeg', png: 'image/png', apng: 'image/apng',
  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif', bmp: 'image/bmp',
  ico: 'image/x-icon', tif: 'image/tiff', tiff: 'image/tiff', heic: 'image/heic', heif: 'image/heif',
}

export function acceptsImage(file: File, accept: string) {
  const extension = file.name.match(/\.([^.]+)$/)?.[1].toLowerCase() ?? ''
  const mime = file.type.toLowerCase() || (Object.hasOwn(imageTypes, extension) ? imageTypes[extension] : '')
  if (!mime.startsWith('image/')) return false
  return acceptsFile({ name: file.name, type: mime }, accept)
}
