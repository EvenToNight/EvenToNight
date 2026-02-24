import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? "/EvenToNight/report/DS/" : "/",
    srcDir: "./markdown",
    title: "DS Project Report",
    head: [
        ["link", { rel: "icon", type: "image/png", href: "./logo.png" }]
    ],
    vite: {
        publicDir: path.resolve(__dirname, '../public')
    },
    themeConfig: {
        nav: [
        { text: "Goal/s of the project", link: "/goals" },
        { text: "Background and link to the theory", link: "/background" },
        { text: "Requirements Analysis", link: "/requirements" },
        { text: "Design", link: "/design" },
        { text: "Salient implementation details", link: "/implementation" },
        { text: "Validation", link: "/validation" },
        { text: "Deployment Instructions", link: "/deployment" },
        { text: "Usage Examples", link: "/usage" },
        { text: "Conclusion", link: "/conclusion" }
        ],
        sidebar: [
        {
            text: "Report",
            items: [
                { text: "Goal/s of the project", link: "/goals" },
                { text: "Background and link to the theory", link: "/background" },
                { text: "Requirements Analysis", link: "/requirements" },
                { text: "Design", link: "/design" },
                { text: "Salient implementation details", link: "/implementation" },
                { text: "Validation", link: "/validation" },
                { text: "Deployment Instructions", link: "/deployment" },
                { text: "Usage Examples", link: "/usage" },
                { text: "Conclusion", link: "/conclusion" }
              ]
        }
        ]
    }
})
