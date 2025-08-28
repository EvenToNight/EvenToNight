export default {
    base: "/EvenToNight/",
    title: "Report Progetto",
    themeConfig: {
        nav: [
        { text: "Introduzione", link: "/" },
        { text: "Requisiti", link: "/requisiti" },
        { text: "Architettura", link: "/architettura" },
        { text: "Conclusioni", link: "/conclusioni" }
        ],
        sidebar: [
        {
            text: "Report",
            items: [
                { text: "Introduzione", link: "/" },
                { text: "Requisiti", link: "/requisiti" },
                { text: "Architettura", link: "/architettura" },
                { text: "Conclusioni", link: "/conclusioni" }
              ]
        }
        ]
    }
}