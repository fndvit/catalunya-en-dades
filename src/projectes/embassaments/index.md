---
title: Panell de dades dels embassaments a Catalunya
toc: false
style: ../dashboard.css
---

```js

const dades = FileAttachment("data/dades.json").json();

```

```js
import chroma from "chroma-js";

const catalanLocale = {
  dateTime: "%A, %e %B %Y, %X",
  date: `%e %B %Y`,
  time: "%H:%M:%S",
  periods: ["AM", "PM"],
  days: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
  shortDays: ["dg.", "dl.", "dt.", "dc.", "dj.", "dv.", "ds."],
  months: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  shortMonths: ["gen.", "feb.", "març", "abr.", "mai.", "jun.", "jul.", "ag.", "set.", "oct.", "nov.", "des."]
};

const locale = d3.timeFormatDefaultLocale(catalanLocale);

const embassamentsShortNames = ({
    'Embassament de Darnius Boadella (Darnius)': 'Darnius Boadella',
    'Embassament de Foix (Castellet i la Gornal)': 'Foix',
    'Embassament de Sau (Vilanova de Sau)': 'Sau',
    'Embassament de Siurana (Cornudella de Montsant)': 'Siurana',
    'Embassament de Sant Ponç (Clariana de Cardener)': 'Sant Ponç',
    'Embassament de Susqueda (Osor)': 'Susqueda',
    'Embassament de Riudecanyes': 'Riudecanyes',
    'Embassament de la Llosa del Cavall (Navès)': 'La Llosa del Cavall',
    'Embassament de la Baells (Cercs)': 'La Baells'
});

const weightedMean = (data) => {
  const total = data.reduce(
    (acc, item) => {
      acc.totalWeight += item.pct * item.capacity;
      acc.totalCapacity += item.capacity;
      return acc;
    },
    { totalWeight: 0, totalCapacity: 0 }
  );

  return total.totalWeight / total.totalCapacity;
}

const sparkbar = (max) => {
  return x => htl.html`<div style="
    background: ${colorScale(x)};
    border:.8px solid ${chroma(colorScale(x)).darken(1).hex()};
    width: ${100 * x / max}%;
    float: right;
    padding-right: 3px;
    box-sizing: border-box;
    overflow: visible;
    display: flex;
    justify-content: end;"><span class="halo">${x.toLocaleString("es")}</span>`
}

const occlusionY = ({radius = 6.5, ...options} = {}) => Plot.initializer(options, (data, facets, { y: {value: Y}, text: {value: T} }, {y: sy}, dimensions, context) => {
  for (const index of facets) {
    const unique = new Set();
    const nodes = Array.from(index, (i) => ({
      fx: 0,
      y: sy(Y[i]),
      visible: unique.has(T[i]) // remove duplicate labels
        ? false
        : !!unique.add(T[i]),
      i
    }));
    d3.forceSimulation(nodes.filter((d) => d.visible))
      .force("y", d3.forceY(({y}) => y)) // gravitate towards the original y
      .force("collide", d3.forceCollide().radius(radius)) // collide
      .stop()
      .tick(20);
    for (const { y, node, i, visible } of nodes) Y[i] = !visible ? NaN : y;
  }
  return {data, facets, channels: {y: {value: Y}}};
});

const colorDomain = [16, 25, 40, 60];
const colorRange = ['#2f61e2', '#4f82de', '#70a3da', '#90c4d6', '#b1e5d1']
const colorScale = d3.scaleThreshold()
  .domain(colorDomain)
  .range(colorRange);

const colorPlot = {
    domain: colorDomain,
    range: colorRange,
    type: "threshold",
    label: "% volum embassat"
  }

const dateFormat = d3.timeFormat("%x");

const sortInput = Inputs.radio(new Map([["% volum embassat", true], ["capacitat", false]]), {value: true, label: "Ordenar per:", format: ([name, value]) => `${name}`})
const sort = Generators.input(sortInput);

const selectInput = Inputs.select(Object.values(embassamentsShortNames), {
    label: "Selecciona un embassament"
  })
const select = Generators.input(selectInput);

const historic = dades.map(d => {
  d.date = new Date(d.date)
  return d;
})
const historicDateSpan = [...new Set(historic.map(d => d.date))]
const [startDate, latestDate] = d3.extent(historicDateSpan);
const yearAgo = new Date();
yearAgo.setFullYear(latestDate.getFullYear() - 1);

const actual = historic.filter(d => d.date >= latestDate);
const actualMean = +weightedMean(actual).toFixed(1);

const table = Inputs.table(historic, {
  columns: ["name", "date", "pct", "level"],
  header: {
    name: "Embassament",
    date: "Data de l'observació",
    pct: "Volum embassat (%)",
    level: "Volum embassat (hm³)"
  },
  format: {
    date: x => dateFormat(x),
    pct: sparkbar(d3.max(historic, d => d.pct)),
    level: x => x.toLocaleString('ca-ES')
  },
  rows: 18,
  sort: "date",
  reverse: true
})

```
# Estat dels embassaments de Catalunya
## Dades actualitzades a ${dateFormat(latestDate)} per embassaments amb capacitat superior a 2 hm³

${
  Plot.legend({color: {
    domain: [16, 25, 40, 60],
    range: ['#2f61e2', '#4f82de', '#70a3da', '#90c4d6', '#b1e5d1'],
    type: "threshold",
    label: "% volum embassat"
  }})
}

<div class="grid grid-cols-4">
  <div class="card grid-colspan-2">
  <h2>Les reserves d'aigua als embassaments estan al ${actualMean.toLocaleString('ca-ES')}%</h2>
  ${sortInput}
    <figure class="grafic" style="max-width: none;">
      ${resize((width) =>
    Plot.plot({
  width,
  height: width > 480 ? 480 : 360,
  marginRight: width > 480 ? 120 : 0,
  x: { domain: [0, 100], label: "% volum embassat" },
  y: { label: "Capacitat (en hm³)" },
  color: colorPlot,
  marks: [
    () => htl.svg`<defs>
      <pattern
        id="diagonal-stripe"
        width="100px"
        height="5px"
        patternUnits="userSpaceOnUse"
        patternContentUnits="userSpaceOnUse"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        patternTransform="rotate(-45)"
      >
        <line
          x1="0"
          x2="100"
          y1="30"
          y2="30"
          stroke-width="40"
          style="stroke: #eee"
        />
      </pattern>
    </defs>`,
    Plot.rectX(
      actual,
      Plot.stackY({
        y: "capacity",
        order: sort ? "pct" : "capacity",
        x2: 100,
        fill: "url(#diagonal-stripe)",
        stroke: "#e0e0e0"
      })
    ),
    Plot.rectX(
      actual,
      Plot.stackY({
        y: "capacity",
        order: sort ? "pct" : "capacity",
        x2: "pct",
        fill: "pct",
        stroke: d => chroma(colorScale(d.pct)).darken(1).hex(),
        strokeWidth: .6,
        title: (d) => ${d.name}\n${d.pct.toLocaleString('ca-ES')}%\n${d.level.toLocaleString('ca-ES')} hm³,
        insetTop: 0.2,
        insetBottom: 0.2,
        tip: true
      })
    ),
    width > 480 ? Plot.text(
      actual,
      occlusionY(
        Plot.stackY({
          y: "capacity",
          order: sort ? "pct" : "capacity",
          x: 100,
          text: "name",
          textAnchor: "start",
          insetTop: 0.2,
          insetBottom: 0.2,
          dx: 16
        })
      )
    )
    : 
    Plot.text(
      actual,
      occlusionY(
        Plot.stackY({
          y: "capacity",
          order: sort ? "pct" : "capacity",
          x: 100,
          text: "name",
          textAnchor: "end",
          insetTop: 0.2,
          insetBottom: 0.2,
          dx: -4
        })
      )
    )
    ,
    Plot.ruleX([actualMean], {strokeWidth: 2}),
    Plot.text(
      [actualMean],
      {
          y: 650,
          x: d => d,
          text: d => `${d.toLocaleString('ca-ES')}%`,
          fontSize: 20,
          fontWeight: "bold",
          textAnchor: "middle",
          fill: "#000",
          stroke:"#f0f0f0",
        })
  ]
})
  )}
    </figure>

  </div>
  <div class="card grid-colspan-2" style="min-height: 480px">
    <h2>Evolució de les reserves en l'últim any</h2>
    <figure class="grafic" style="max-width: none;">
${resize((width) =>
  Plot.plot({
  width: width,
  height: width > 480 ? 500 : 420,
  marginRight: width > 480 ? 120 : 0,
  y: { grid: true, label: "% volum embassat" },
  color: colorPlot,
  style: "overflow: visible;",
  marks: [
    Plot.lineY(
      historic.filter((d) => d.date > yearAgo),
      {
        x: "date",
        y: "pct",
        z: "name",
        stroke: d => chroma(colorScale(d.pct)).darken(1).hex(),
        strokeWidth: 3.6
      }
    ),
    Plot.lineY(
      historic.filter((d) => d.date > yearAgo),
      {
        x: "date",
        y: "pct",
        z: "name",
        stroke: "pct",
        strokeWidth: 2,
        title: d => `${d.name}\n${dateFormat(d.date)}\n${d.pct.toLocaleString('ca-ES')}% \n${d.level.toLocaleString('ca-ES')} hm³`,
        tip: true
      }
    ),
    Plot.dot(
      historic.filter((d) => d.date > yearAgo),
      Plot.selectLast({
        r: 3,
        x: "date",
        y: "pct",
        z: "name",
        fill: "pct",
        stroke: "none",
        stroke: d => chroma(colorScale(d.pct)).darken(1).hex(),
        strokeWidth: .8,
      })
    ),
    width > 480 ?
    Plot.text(
      historic.filter((d) => d.date > yearAgo),
      occlusionY(
        Plot.selectLast({
          x: "date",
          y: "pct",
          z: "name",
          text: "name",
          textAnchor: "start",
          dx: 6
        })
      )
    )
    :
    Plot.text(
      historic.filter((d) => d.date > yearAgo),
      occlusionY(
        Plot.selectLast({
          x: "date",
          y: "pct",
          z: "name",
          text: "name",
          textAnchor: "end",
          stroke: "#f3f3f3",
          fill: "#000",
          dx: -6
        })
      )
    )
  ]
})
)}
</figure>
</div>
</div>

<div class="card grid grid-cols-4">
  <div class="grid-colspan-1" style="max-height:200px;">
  ${selectInput}

  <h1 style="padding-top:1rem">${actual.find((d) => d.name === select).name}</h1>
  <h3>Dades actualitzades a ${dateFormat(actual.find((d) => d.name === select).date)}</h3>

  <p style="margin: 1rem 0 0 0; padding: 0"><b>Capacitat:</b> ${actual.find((d) => d.name === select).capacity.toLocaleString('ca-ES')} hm³</p>
  <p style="margin: .3rem 0 0 0; padding: 0"><b>Volum embassat:</b> ${actual.find((d) => d.name === select).level.toLocaleString('ca-ES')} hm³</p>
  <p style="margin: .3rem 0 0 0; padding: 0"><b>Percentatge:</b> ${actual.find((d) => d.name === select).pct.toLocaleString('ca-ES')}%</p>
  </div>
  <div class="grid-colspan-3">
  <h3><span class="legend daily"></span>Dades diàries <span class="legend monthly"></span>Mitjana mòbil mensual <span class="legend yearly"></span>Mitjana mòbil anual</h3>
  ${
    resize((width) =>
      Plot.plot({
  width: width,
  height: width > 480 ? width / 3 : width,
  y: { grid: true, label: "% volum embassat" },
  color: colorPlot,
  style: "overflow: visible;",
  marks: [
    Plot.lineY(
      historic.filter((d) => d.name === select),
      {
        x: "date",
        y: "pct",
        z: "name",
        stroke: "#BDBDBD"
      }
    ),
    Plot.lineY(
      historic.filter((d) => d.name === select),
      Plot.windowY(365, {
        x: "date",
        y: "pct",
        z: "name",
        stroke: "#000",
        strokeDasharray: [2,4]
      })
    ),
    Plot.lineY(
      historic.filter((d) => d.name === select),
      Plot.windowY(28, {
        x: "date",
        y: "pct",
        z: "name",
        strokeWidth: 3.6,
        stroke: d => chroma(colorScale(d.pct)).darken(1).hex(),
      })
    ),
    Plot.lineY(
      historic.filter((d) => d.name === select),
      Plot.windowY(28, {
        x: "date",
        y: "pct",
        z: "name",
        strokeWidth: 2.4,
        stroke: "pct",
        title: d => `${d.name}\n${dateFormat(d.date)}\n${d.pct.toLocaleString('ca-ES')}% \n${d.level.toLocaleString('ca-ES')} hm³`,
        tip: true
      })
    )
  ]
})
    )
  }
  </div>
</div>
<div class="card" style="padding: 0;">
${table}
</div>

<p class="notes">Aquest panell de dades reimagina la visualització de <a href="https://aca.gencat.cat/ca/laigua/consulta-de-dades/dades-obertes/visualitzacio-interactiva-dades/estat-embassaments/">l'Estat dels embassaments a Catalunya</a> de l'Agència Catalana de l'Aigua, reutilitzant les <a href="https://analisi.transparenciacatalunya.cat/Medi-Ambient/Quantitat-d-aigua-als-embassaments-de-les-Conques-/gn9e-3qhr/about_data">dades obertes disponibles</a> al portal de Transparència.</p>
