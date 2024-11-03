import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
    plugins: [svelte(), viteSingleFile()],
    resolve: {
        alias: {
            $components: path.resolve(__dirname, './src/components'),
            $pages: path.resolve(__dirname, './src/pages'),
            $lib: path.resolve(__dirname, './src/lib')
        }
    },
    root: './',
    build: {
        outDir: 'dist'
    },
    publicDir: 'static'
});
