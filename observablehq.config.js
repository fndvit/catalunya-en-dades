export default {
  title: "Catalunya 👀 en dades",
  head: `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catalunya 👀 en dades</title>
  <meta name="description" content="És una iniciativa per reimaginar la visualització de dades obertes de l'administració catalana fent servir Observable Framework, oberta a persones que estigueu aprenent ciència de dades, comunicació, disseny o visualització de dades, amb premis mensuals i un gran premi final a les millors col·laboracions.">
  <meta name="keywords" content="Catalunya, dades obertes, visualització de dades, ciència de dades, Observable Framework, premis, col·laboració, comunicació, disseny">
  <meta name="author" content="Fundació ViT, Visualització per a la Transparència">
  <meta property="og:title" content="Catalunya 👀 en dades">
  <meta property="og:description" content="És una iniciativa per reimaginar la visualització de dades obertes de l'administració catalana fent servir Observable Framework, oberta a persones que estigueu aprenent ciència de dades, comunicació, disseny o visualització de dades, amb premis mensuals i un gran premi final a les millors col·laboracions.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://catalunya-en-dades.fndvit.org/">
  <meta property="og:image" content="/docs/img/social.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Catalunya 👀 en dades">
  <meta name="twitter:description" content="És una iniciativa per reimaginar la visualització de dades obertes de l'administració catalana fent servir Observable Framework, oberta a persones que estigueu aprenent ciència de dades, comunicació, disseny o visualització de dades, amb premis mensuals i un gran premi final a les millors col·laboracions.">
  <meta name="twitter:image" content="/docs/img/social.png">
  <link rel="shortcut icon" type="image/x-icon" href="https://images.squarespace-cdn.com/content/v1/5e5b7eebeb83b746b6481a2d/1604671720103-EPJSELDNWVIPCWI63H7G/ke17ZwdGBToddI8pDm48kNCIUUInZz-JelovUC4TKJ9Zw-zPPgdn4jUwVcJE1ZvWQUxwkmyExglNqGp0IvTJZUJFbgE-7XRK3dMEBRBhUpy2nmdcYIRqEQwGN8P7xrL_yE-hs8s0G614KmYuoTh2b5xIcJ7iebeF3-4wt8VfJy4/favicon.ico?format=100w">
  <link rel="preconnect" href="https://use.typekit.net" crossorigin />
  <link rel="preconnect" href="https://p.typekit.net" crossorigin />
  <link rel="preload" as="style" href="https://use.typekit.net/vpz4xzt.css" />
  <link rel="stylesheet" href="https://use.typekit.net/vpz4xzt.css" media="print" onload="this.media='all'" />
  <noscript>
    <link rel="stylesheet" href="https://use.typekit.net/vpz4xzt.css" />
  </noscript>
  `,
  search: true,
  pages: [
    {
      name: "Documentació",
      path: "/docs/",
      pages: [
        {name: "La iniciativa", path: "/docs/"},
        {name: "Vols participar?", path: "/docs/participa.html"},
        {name: "Una petita guia", path: "/docs/guia.html"},
        {name: "Qüestions tècniques", path: "/docs/preguntes-tecniques.html"},
        {name: "Un cas d'estudi", path: "/docs/exemples.html"},
        {name: "El nostre equip", path: "/docs/equip.html"},
        {name: "Codi de conducta", path: "/docs/codi-de-conducta.html"},
        {name: "Sponsors", path: "/docs/sponsors.html"}
      ]
    },
    {
      name: "Projectes",
      path: "/projectes/",
      open: false,
      pages: [
        {name: "Llistat de propostes", path: "/projectes/"},
        {name: "Embassaments", path: "/projectes/embassaments/"},
        {name: "Consum d'aigua", path: "/projectes/consum-aigua/"},
      ]
    }
  ],
  header:`<style>

  #observablehq-header .logo {
    height: 2rem;
    width: auto;
  }

  #observablehq-header a[href] {
    color: inherit;
  }
  
  #observablehq-header a[target="_blank"] {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    text-decoration: none;
  }
  
  #observablehq-header a[target="_blank"]:hover span {
    text-decoration: underline;
  }
  
  #observablehq-header a[target="_blank"]:not(:hover, :focus)::after {
    color: var(--theme-foreground-muted);
  }
  
  @container not (min-width: 640px) {
    .hide-if-small {
      display: none;
    }
  }
  
  </style>
  <div style="display: flex; align-items: center; gap: 0.5rem; height: 2.2rem; margin: -1.5rem -2rem 2rem -2rem; padding: 0.5rem 2rem; border-bottom: solid 1px var(--theme-foreground-faintest); font: 500 16px var(--sans-serif);">
    <div style="display: flex; flex-grow: 1; justify-content: space-between; align-items: center;">
      <b>
        <a href="" target="_self" rel="">
        Catalunya 👀 en dades
        </a>
      </b>
      <span style="display: flex; align-items: baseline; gap: 0.5rem; font-size: 13px;">
        <a target="_blank" href="https://github.com/fndvit/catalunya-en-dades">
          <svg aria-roledescription="logo" aria-label="logo de GitHub" viewBox="0 0 64 64" width="48" height="48" class="svelte-1jqst0j"><path d="M32,16c-8.8,0-16,7.2-16,16c0,7.1,4.6,13.1,10.9,15.2 c0.8,0.1,1.1-0.3,1.1-0.8c0-0.4,0-1.4,0-2.7c-4.5,1-5.4-2.1-5.4-2.1c-0.7-1.8-1.8-2.3-1.8-2.3c-1.5-1,0.1-1,0.1-1 c1.6,0.1,2.5,1.6,2.5,1.6c1.4,2.4,3.7,1.7,4.7,1.3c0.1-1,0.6-1.7,1-2.1c-3.6-0.4-7.3-1.8-7.3-7.9c0-1.7,0.6-3.2,1.6-4.3 c-0.2-0.4-0.7-2,0.2-4.2c0,0,1.3-0.4,4.4,1.6c1.3-0.4,2.6-0.5,4-0.5c1.4,0,2.7,0.2,4,0.5c3.1-2.1,4.4-1.6,4.4-1.6 c0.9,2.2,0.3,3.8,0.2,4.2c1,1.1,1.6,2.5,1.6,4.3c0,6.1-3.7,7.5-7.3,7.9c0.6,0.5,1.1,1.5,1.1,3c0,2.1,0,3.9,0,4.4 c0,0.4,0.3,0.9,1.1,0.8C43.4,45.1,48,39.1,48,32C48,23.2,40.8,16,32,16z"></path></svg>
          <span>Col·labora al repositori</span>
        </a>
      </span>
    </div>
  </div>`,
  root: "src",
  style:"style.css",
  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  typographer: true, // smart quotes and other typographic improvements
  preserveExtension: false,
  footer: '',
};
