import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? "/EvenToNight/" : "/",
    srcDir: "./markdown",
    title: "Report Progetto ASW",
    head: [
        ["link", { rel: "icon", type: "image/png", href: "./logo.png" }]
    ],
    vite: {
        publicDir: path.resolve(__dirname, '../public')
    },
    themeConfig: {
        nav: [
        { text: "Introduzione", link: "/introduzione" },
        { text: "Requisiti", link: "/requisiti" },
        { text: "Design", link: "/design" },
        { text: "Tecnologie", link: "/tecnologie" },
        { text: "Codice", link: "/codice" },
        { text: "Test", link: "/test" },
        { text: "Deployment", link: "/deployment" },
        { text: "Conclusioni", link: "/conclusioni" }
        ],
        sidebar: [
        {
            text: "Report",
            items: [
                { text: "Introduzione", link: "/introduzione" },
                { text: "Requisiti", link: "/requisiti" },
                { text: "Design", link: "/design" },
                { text: "Tecnologie" , link: "/tecnologie" },
                { text: "Codice", link: "/codice" },
                { text: "Test", link: "/test" },
                { text: "Deployment", link: "/deployment" },
                { text: "Conclusioni", link: "/conclusioni" }
              ]
        }
        ]
    }
})
