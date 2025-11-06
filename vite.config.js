import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fs from 'node:fs'
import * as path from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getHtmlEntryFiles(srcDir) {
	const entry = {};

	function traverseDir(currentDir) {
	  const files = fs.readdirSync(currentDir);

	  files.forEach((file) => {
		const filePath = path.join(currentDir, file);
		const isDirectory = fs.statSync(filePath).isDirectory();

		if (isDirectory) {
		  // If it's a directory, recursively traverse it
		  traverseDir(filePath);
		} else if (path.extname(file) === '.html') {
		  // If it's an HTML file, add it to the entry object
		  const name = path.relative(srcDir, filePath).replace(/\..*$/, '');
		  entry[name] = filePath;
		}
	  });
	}

	traverseDir(srcDir);

	return entry;
}



export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                ...getHtmlEntryFiles(resolve(__dirname, 'pages'))
                //login: resolve(__dirname, 'pages/login/index.html'),
            },
        },
    },
    optimizeDeps: {
		entries: 'src/**/*{.html,.css,.js}'
	}

})