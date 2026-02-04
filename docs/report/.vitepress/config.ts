export default {
    base: "/EvenToNight/",
    title: "Report Progetto",
    head: [
        ["link", { rel: "icon", type: "image/png", href: "./logo.png" }]
    ],
    themeConfig: {
        nav: [
        { text: "Introduzione", link: "/" },
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
                { text: "Introduzione", link: "/" },
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
}