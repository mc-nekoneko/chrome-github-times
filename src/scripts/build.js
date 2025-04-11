import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../')

// マニフェストファイルをコピー
const manifestSource = path.join(__dirname, 'manifest.json')
const manifestDest = path.join(__dirname, 'dist', 'manifest.json')

try {
  // distディレクトリを作成（存在しない場合）
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'))
  }

  // assets/iconsディレクトリを作成
  if (!fs.existsSync(path.join(__dirname, 'dist', 'assets'))) {
    fs.mkdirSync(path.join(__dirname, 'dist', 'assets'))
  }
  if (!fs.existsSync(path.join(__dirname, 'dist', 'assets', 'icons'))) {
    fs.mkdirSync(path.join(__dirname, 'dist', 'assets', 'icons'))
  }

  // マニフェストファイルをコピー
  fs.copyFileSync(manifestSource, manifestDest)

  // アイコンファイルをコピー
  const iconSizes = ['16', '48', '128']
  for (const size of iconSizes) {
    const iconSource = path.join(
      __dirname,
      'assets',
      'icons',
      `icon${size}.png`,
    )
    const iconDest = path.join(
      __dirname,
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
