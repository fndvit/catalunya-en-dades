---
title: Qüestions tècniques
toc: true
---

```js
import chroma from "npm:chroma-js";
 
const dadesAtur = [
  { year: 2000, Barcelona: 10, Girona: 8, Lleida: 7, Tarragona: 9 },
  { year: 2001, Barcelona: 9, Girona: 7.5, Lleida: 6.8, Tarragona: 8.5 },
  { year: 2002, Barcelona: 8.5, Girona: 7.2, Lleida: 6.6, Tarragona: 8.2 },
  { year: 2003, Barcelona: 8.2, Girona: 7, Lleida: 6.3, Tarragona: 8 },
  { year: 2004, Barcelona: 8, Girona: 6.8, Lleida: 6, Tarragona: 7.8 },
  { year: 2005, Barcelona: 7.8, Girona: 6.6, Lleida: 5.8, Tarragona: 7.6 },
  { year: 2006, Barcelona: 7.5, Girona: 6.3, Lleida: 5.6, Tarragona: 7.3 },
  { year: 2007, Barcelona: 7.2, Girona: 6, Lleida: 5.4, Tarragona: 7 },
  { year: 2008, Barcelona: 7, Girona: 5.8, Lleida: 5.2, Tarragona: 6.8 },
  { year: 2009, Barcelona: 9, Girona: 7.5, Lleida: 6.8, Tarragona: 8.5 },
  { year: 2010, Barcelona: 9.5, Girona: 7.8, Lleida: 7, Tarragona: 8.8 },
  { year: 2011, Barcelona: 10, Girona: 8, Lleida: 7.2, Tarragona: 9 },
  { year: 2012, Barcelona: 10.5, Girona: 8.5, Lleida: 7.5, Tarragona: 9.5 },
  { year: 2013, Barcelona: 11, Girona: 9, Lleida: 8, Tarragona: 10 },
  { year: 2014, Barcelona: 10.8, Girona: 8.8, Lleida: 7.8, Tarragona: 9.8 },
  { year: 2015, Barcelona: 10.5, Girona: 8.5, Lleida: 7.5, Tarragona: 9.5 },
  { year: 2016, Barcelona: 10.2, Girona: 8.2, Lleida: 7.2, Tarragona: 9.2 },
  { year: 2017, Barcelona: 10, Girona: 8, Lleida: 7, Tarragona: 9 },
  { year: 2018, Barcelona: 9.8, Girona: 7.8, Lleida: 6.8, Tarragona: 8.8 },
  { year: 2019, Barcelona: 9.5, Girona: 7.5, Lleida: 6.5, Tarragona: 8.5 },
  { year: 2020, Barcelona: 10, Girona: 8, Lleida: 7, Tarragona: 9 },
  { year: 2021, Barcelona: 9.5, Girona: 7.5, Lleida: 6.5, Tarragona: 8.5 },
  { year: 2022, Barcelona: 9, Girona: 7, Lleida: 6, Tarragona: 8 },
  { year: 2023, Barcelona: 8, Girona: 6, Lleida: 5, Tarragona: 7 }
];

const blue = "#3b5fc0", yellow = "#ffd754", grey = "#c7c1bf", purple = "#a160af", orange = "#ff9c38", green = "#5ca34b", pink = "#f794b9", sky = "#61b0ff", red = "#ed393f", brown = "#a87a54";

const lineChartProvince = (width, height, province, color) => Plot.plot({
  width,
  height,
  marginRight: 60,
  marks: [
    Plot.lineY(dadesAtur, {x: "year", y:province, stroke: chroma(color).darken().hex(), strokeWidth: 3, title: province}),
    Plot.lineY(dadesAtur, {x: "year", y:province, stroke: chroma(color).darken().hex(), strokeWidth: 2, title: province, marker: "dot"}),
    Plot.lineY(dadesAtur, {x: "year", y:province, stroke: color, title: province, marker: "dot", curve: "monotone-x"}),
    Plot.text(dadesAtur, Plot.selectLast({x: "year", y: province, text: d => province, textAnchor: "start", dx: 6})),
  ],
  x: {
    label: "Any",
    tickFormat: d3.format("d")
  },
  y: {
    grid: true,
    label: "Taxa d'atur (%)"
  }
});

const MAPBOX_TOKEN = "pk.eyJ1IjoiZm5kdml0IiwiYSI6ImNseDR5dDV5dTBmeWMyaXNjemRkbDA3cHEifQ.HgSEJBTQzDFB-qBS2C4dvg";
```

# Qüestions tècniques
---
## Gràfics amb Plot
Plot és una biblioteca de JavaScript desenvolupada per Observable per a la visualització de dades, especialment dissenyada per accelerar l'anàlisi exploratòria de dades. Ofereix una interfície concisa i expressiva que permet crear gràfics sofisticats amb menys codi. Plot està construït sobre d3, però simplifica moltes de les seves operacions per facilitar-ne l'ús.

### Exemple de codi per a gràfic de línies
Aquest exemple visualitza dades anuals d'atur per província a Catalunya.

```js echo
dadesAtur
```

${resize((width) => lineChart(width))}


```js echo
const lineChart = (width) => Plot.plot({
  width,
  height: width * 0.5,
  marginRight: 60,
  marks: [
    Plot.lineY(dadesAtur, {x: "year", y: "Barcelona", stroke: blue, title: "Barcelona", marker: true, curve: "monotone-x", tip: true}),
    Plot.lineY(dadesAtur, {x: "year", y: "Girona", stroke: yellow, title: "Girona", marker: true, curve: "monotone-x", tip: true}),
    Plot.lineY(dadesAtur, {x: "year", y: "Lleida", stroke: grey, title: "Lleida", marker: true, curve: "monotone-x", tip: true}),
    Plot.lineY(dadesAtur, {x: "year", y: "Tarragona", stroke: purple, title: "Tarragona", marker: true, curve: "monotone-x", tip: true}),
    Plot.text(dadesAtur, Plot.selectLast({x: "year", y: "Barcelona", text: d => "Barcelona", textAnchor: "start", dx: 6})),
    Plot.text(dadesAtur, Plot.selectLast({x: "year", y: "Girona", text: d =>  "Girona", textAnchor: "start", dx: 6})),
    Plot.text(dadesAtur, Plot.selectLast({x: "year", y: "Lleida", text: d =>  "Lleida", textAnchor: "start", dx: 6})),
    Plot.text(dadesAtur, Plot.selectLast({x: "year", y: "Tarragona", text: d =>  "Tarragona", textAnchor: "start", dx: 6}))
  ],
  x: {
    label: "Any",
    tickFormat: d3.format("d")
  },
  y: {
    grid: true,
    label: "Taxa d'atur (%)"
  }
});
```

Normalment, utilitzareu els **gràfics dins de targetes** en un panell de dades. Llegiu més sobre les [nostres guies sobre com estructurar panells per a aquest projecte](./guia.md) i sobre com funcionen les [*grids* a Observable Framework](https://observablehq.com/framework/markdown#grids).

A sota es mostra un exemple de quatre *cards* per a les quatre províncies.

```html echo
<div class="grid grid-cols-2" style="grid-auto-rows: 240px;">
  <div class="card">
    ${resize((width, height) => lineChartProvince(width, height, "Barcelona", blue))}
  </div>
  <div class="card">
    ${resize((width, height) => lineChartProvince(width, height, "Girona", yellow))}
  </div>
</div>
```

Més examples de gràfics aqui.

## Mapes amb Mapbox
Mapbox és una eina poderosa per integrar mapes interactius en aplicacions web. En aquesta secció, explorarem com utilitzar Mapbox amb Observable Framework per crear mapes detallats i interactius. Això inclou l'ús de choropleths per mostrar dades geoespacials.

### Exemple de codi per a un mapa bàsic
Aquest exemple mostra com integrar un mapa bàsic de Mapbox dins d'una pàgina d'Observable.

```js echo
const simple = display(document.createElement("div"));
simple.style = "height: 480px;";

const map = new mapboxgl.Map({
  container: simple,
  accessToken: MAPBOX_TOKEN,
  style: 'mapbox://styles/fndvit/clx4zgywv00af01qq1jp42apa',
  center: [2.1745, 41.404],
  zoom: 16,
  pitch: 62,
  bearing: -20
});

invalidation.then(() => map.remove());
```

## Exemple de codi per a un mapa de coropletes
Aquest exemple mostra com crear un mapa coroplèric, que fa servir color per representar la variable estadística al mapa. En aquest cas es visualitzen dades d'atur per provincia.

```js echo
const choropleth = display(document.createElement("div"));
choropleth.style = "height: 540px;";

const map = new mapboxgl.Map({
  container: choropleth,
  style: 'mapbox://styles/mapbox/light-v10',
  accessToken: MAPBOX_TOKEN,
  center: [2.1745, 41.65],
  zoom: 6.8
});

map.on('load', function () {
  map.addSource('atur', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/spain-provinces.geojson' // URL a les dades GeoJSON
  });

  map.addLayer({
    id: 'atur',
    type: 'fill',
    source: 'atur',
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'unemployment_rate'], // Nom de la propietat que conté la taxa d'atur
        0, '#f8d5cc',
        10, '#f4bfb6',
        20, '#f1a8a5',
        30, '#ee8f9a',
        40, '#ec739b',
        50, '#dd5ca8',
        60, '#c44cc0',
        70, '#9f43d7',
        80, '#6e40e6'
      ],
      'fill-opacity': 0.75
    }
  },
  "waterway-label"
  );
});

```

- **Carregadors de dades**: Codi d'exemple per carregar diversos formats de dades (CSV, JSON, APIs).
- **Exemple de codi de gràfics**: Fragments i plantilles per a tipus comuns de gràfics utilitzant Plot.
- **Exemple de codi de mapes**: Exemples d'integració de mapes interactius en Mapbox.
- **Gestió del codi**:
  - Bones pràctiques per mantenir el codi ordenat i ben comentat.
  - Guia pas a pas sobre com crear i enviar Pull Requests (PRs) per a projectes col·laboratius.