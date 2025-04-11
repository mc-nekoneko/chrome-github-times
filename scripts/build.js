import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const manifestSource = path.join(rootDir, 'manifest.json')
const manifestDest = path.join(rootDir, 'dist', 'manifest.json')

try {
  if (!fs.existsSync(path.join(rootDir, 'dist'))) {
    fs.mkdirSync(path.join(rootDir, 'dist'))
  }

  if (!fs.existsSync(path.join(rootDir, 'dist', 'assets'))) {
    fs.mkdirSync(path.join(rootDir, 'dist', 'assets'))
  }
  if (!fs.existsSync(path.join(rootDir, 'dist', 'assets', 'icons'))) {
    fs.mkdirSync(path.join(rootDir, 'dist', 'assets', 'icons'))
  }

  fs.copyFileSync(manifestSource, manifestDest)

  const iconSizes = ['16', '48', '128']
  for (const size of iconSizes) {
    const iconSource = path.join(
      rootDir,
      'assets',
      'icons',
      `icon${size}.png`,
    )
    const iconDest = path.join(
      rootDir,
      'dist',
      'assets',
      'icons',
      `icon${size}.png`,
    )
    fs.copyFileSync(iconSource, iconDest)
  }

  console.log('ビルド後の処理が完了しました。')
} catch (error) {
  console.error('ビルド後の処理中にエラーが発生しました:', error)
  process.exit(1)
}
