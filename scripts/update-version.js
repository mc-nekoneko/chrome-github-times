import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const newVersion = process.argv[2];

if (!newVersion) {
  console.error('エラー: バージョン番号を指定してください');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('エラー: バージョン番号はX.Y.Zの形式で指定してください');
  process.exit(1);
}

const manifestPath = path.join(rootDir, 'manifest.json');
try {
  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const oldVersion = manifestData.version;
  manifestData.version = newVersion;
  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
  console.log(`manifest.json: ${oldVersion} -> ${newVersion}`);
} catch (error) {
  console.error('manifest.jsonの更新に失敗しました:', error);
  process.exit(1);
}

const packagePath = path.join(rootDir, 'package.json');
try {
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const oldVersion = packageData.version;
  packageData.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
  console.log(`package.json: ${oldVersion} -> ${newVersion}`);
} catch (error) {
  console.error('package.jsonの更新に失敗しました:', error);
  process.exit(1);
}

console.log('バージョン更新が完了しました。');
console.log('次のコマンドを実行してリリースを作成できます：');
console.log(`git commit -am "バージョン ${newVersion} に更新"`);
console.log(`git tag v${newVersion}`);
console.log('git push && git push --tags'); 
