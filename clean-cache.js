const fs = require('fs');
const path = require('path');

console.log('🧹 Iniciando limpieza completa de cache...');

// Función para eliminar directorios recursivamente
function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
    console.log(`🗑️ Eliminado: ${dirPath}`);
  }
}

// Directorios a limpiar
const directoriesToClean = [
  'node_modules/.vite',
  'node_modules/.cache',
  '.vite',
  'dist',
  '.cache',
  'build'
];

console.log('📋 Limpiando directorios de cache...');
directoriesToClean.forEach(dir => {
  deleteDirectory(dir);
});

// Limpiar archivos específicos
const filesToClean = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml'
];

console.log('📋 Limpiando archivos de lock...');
filesToClean.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`🗑️ Eliminado: ${file}`);
  }
});

console.log('✅ Limpieza completada!');
console.log('');
console.log('🔄 Ahora ejecuta:');
console.log('npm install');
console.log('npm run build');
