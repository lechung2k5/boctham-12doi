import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Đang bắt đầu quy trình đóng gói BocTham12Doi.exe...');

// 1. Build Client
console.log('📦 1/4 Đang build Frontend React (Vite)...');
execSync('npm run build --prefix client', { stdio: 'inherit' });

// 2. Bundle Server with esbuild
console.log('⚡ 2/4 Đang bundle Server với esbuild...');
if (!fs.existsSync('build-temp')) fs.mkdirSync('build-temp');
execSync('npx esbuild server/src/entry_sea.js --bundle --platform=node --target=node20 --format=cjs --outfile=build-temp/bundle.js', { stdio: 'inherit' });

// 3. Generate SEA Blob
console.log('⚙️ 3/4 Đang tạo Node.js Single Executable Blob...');
fs.writeFileSync('build-temp/sea-config.json', JSON.stringify({
  main: 'bundle.js',
  output: 'sea-prep.blob',
  disableExperimentalSEAWarning: true
}, null, 2));

execSync('node --experimental-sea-config build-temp/sea-config.json', { cwd: 'build-temp', stdio: 'inherit' });

// 4. Inject into executable
console.log('💉 4/4 Đang inject mã nguồn vào BocTham12Doi.exe...');
const nodePath = process.execPath;
fs.copyFileSync(nodePath, 'BocTham12Doi.exe');
execSync('npx --yes postject BocTham12Doi.exe NODE_SEA_BLOB build-temp/sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2', { stdio: 'inherit' });

// Cleanup
fs.rmSync('build-temp', { recursive: true, force: true });

console.log('\n✅ ĐÃ HOÀN TẤT ĐÓNG GÓI THÀNH CÔNG: BocTham12Doi.exe');

