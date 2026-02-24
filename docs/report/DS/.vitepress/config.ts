import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? "/EvenToNight/report/DS/" : "/",
    srcDir: "./markdown",
    title: "Report Progetto DS",
    head: [
        ["link", { rel: "icon", type: "image/png", href: "./logo.png" }]
    ],
    vite: {
        publicDir: path.resolve(__dirname, '../public')
    },
    themeConfig: {
        nav: [
        { text: "Introduzione", link: "/introduzione" }
        ],
        sidebar: [
        {
            text: "Report",
            items: [
                { text: "Introduzione", link: "/introduzione" }
              ]
        }
        ]
    }
})
