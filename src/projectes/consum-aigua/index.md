---
title: Panell de dades del consum d'aigua a Catalunya
toc: false
style: ../dashboard.css
---

<!--External libs-->
```js
import {Trend} from "./components/trend.js";
import {extent, format, rollup, timeFormat} from "npm:d3";
```

<!--Comarques geo -->
```js
const comarques_catalunya = FileAttachment("data/comarques_catalunya.json").json();
```

<!--Províncies geo -->
```js
const provincies_catalunya = FileAttachment("data/provincies_catalunya.json").json();
```

<!--Consum daigua per província-->
```js
const consum_daigua_per_comarca_data = FileAttachment("data/consum_d_aigua_a_catalunya_per_comarques.csv").csv();
```

<!--Comarques per província-->
```js
const girona_comarques = [
  "Alt Empordà","Baix Empordà","Cerdanya","Garrotxa","Gironès","Pla de l'Estany","Ripollès","Selva"
];
const barcelona_comarques = [
  "Alt Penedès","Anoia","Bages","Baix Llobregat","Barcelonès","Berguedà","Garraf","Maresme","Moianès","Osona","Vallès Occidental","Vallès Oriental","Lluçanès"
];
const lleida_comarques = [
  "Alt Urgell","Alta Ribagorça","Garrigues","Noguera","Pallars Jussà","Pallars Sobirà","Pla d'Urgell","Segrià","Segarra","Solsonès","Urgell","Val d'Aran"
];
const tarragona_comarques = [
  "Alt Camp","Baix Camp","Baix Penedès","Baix Ebre","Conca de Barberà","Montsià","Priorat","Ribera d'Ebre","Tarragonès",
  "Terra Alta"
];
```

<!--Consum daigua per província-->
```js
// Funció per trobar la província d'una comarca
function trobarProvincia(comarca) {
  if (girona_comarques.includes(comarca)) return "Girona";
  if (barcelona_comarques.includes(comarca)) return "Barcelona";
  if (lleida_comarques.includes(comarca)) return "Lleida";
  if (tarragona_comarques.includes(comarca)) return "Tarragona";
  return comarca; 
}

// Funció per agrupar les dades per província i any
function agruparConsumPerProvincia(data) {
  const resultat = {};
  data.forEach(item => {
    const any = item["Any"];
    const provincia = trobarProvincia(item["Comarca"]);    
    if (!resultat[any]) {
      resultat[any] = {};
    }    
    if (!resultat[any][provincia]) {
      resultat[any][provincia] = {
        Any: any,
        "Província": provincia,
        "Codi província": "",
        Població: 0,
        "Domèstic xarxa": 0,
        "Activitats econòmiques i fonts pròpies": 0,
        Total: 0,
        "Consum domèstic per càpita": 0
      };
    }
    // Assignar el codi de província
    if (provincia === "Barcelona") {
      resultat[any][provincia]["Codi província"] = "08";
    } else if (provincia === "Girona") {
      resultat[any][provincia]["Codi província"] = "17";
    } else if (provincia === "Lleida") {
      resultat[any][provincia]["Codi província"] = "25";
    } else if (provincia === "Tarragona") {
      resultat[any][provincia]["Codi província"] = "43";
    }
    // Sumem els valors corresponents
    resultat[any][provincia].Població += parseInt(item["Població"]) || 0;
    resultat[any][provincia]["Domèstic xarxa"] += parseInt(item["Domèstic xarxa"]) || 0;
    resultat[any][provincia]["Activitats econòmiques i fonts pròpies"] += parseInt(item["Activitats econòmiques i fonts pròpies"]) || 0;
    resultat[any][provincia].Total += parseInt(item["Total"]) || 0;
    resultat[any][provincia]["Consum domèstic per càpita"] += parseInt(item["Consum domèstic per càpita"]) || 0;

  });
  // Convertim l'objecte en un array d'objectes
  return Object.values(resultat).flatMap(prov => Object.values(prov));
}
const consum_daigua_per_provincia_data = agruparConsumPerProvincia(consum_daigua_per_comarca_data);
```

<!--Consum mitja anual Catalunya-->
```js
const consumPerAny = consum_daigua_per_comarca_data.reduce((acc, { Any, Total }) => {
  acc[Any] = (acc[Any] || 0) + parseFloat(Total);
  return acc;
}, {});
const totalConsum = Object.values(consumPerAny).reduce((sum, total) => sum + total, 0);
const consumMitjaAny = totalConsum / Object.keys(consumPerAny).length;
```

<!--Consum 2023 Catalunya-->
```js
const selectYearInput = Inputs.range(
  [d3.min(consum_daigua_per_comarca_data, d => +d.Any), d3.max(consum_daigua_per_comarca_data, d => +d.Any)],
  { 
    step: 1, 
    value: d3.max(consum_daigua_per_comarca_data, d => +d.Any)
  }
);
const selectYear = Generators.input(selectYearInput);
```
```js
const comarcaAggAny = consum_daigua_per_comarca_data.filter(d => d.Any == selectYear);
const totalConsumCatalunya = comarcaAggAny.reduce((sum, d) => sum + (+d["Total"] || 0), 0);
const diferenciaPercent = ((totalConsumCatalunya - consumMitjaAny) / consumMitjaAny) * 100;
```

<!--Consum mitja domèstic per capita anual Catalunya-->
```js
const consumPerCapitaPerAny = consum_daigua_per_comarca_data.reduce((acc, d) => {
  acc[d.Any] = (acc[d.Any] || 0) + parseFloat(d["Consum domèstic per càpita"] || 0);
  return acc;
}, {});
const totalPerCapitaConsum = Object.values(consumPerCapitaPerAny).reduce((sum, total) => sum + total, 0);
const consumPerCapitaMitjaAny = totalPerCapitaConsum / Object.keys(consumPerCapitaPerAny).length;
```

<!--Consum domèstic per Capita 2023 Catalunya-->
```js
const comarcaAggAny_1 = consum_daigua_per_comarca_data.filter(d => d.Any == selectYear);
const totalConsumPerCapitaCatalunya = comarcaAggAny_1.reduce((sum, d) => sum + (+d["Consum domèstic per càpita"] || 0), 0);
const diferenciaPercent_1 = ((totalConsumPerCapitaCatalunya - consumPerCapitaMitjaAny) / consumPerCapitaMitjaAny) * 100;
```

<!--Mapa de consum comarcal o provincial-->
```js
const selectorMapaInput = Inputs.radio(
  ["Comarcal", "Provincial"],
  { 
    label: "Selecciona el tipus de mapa",
    value: "Comarcal"
  }
);
const selectorMapa = Generators.input(selectorMapaInput);

const selectorConsumInput = Inputs.select(
  ["Total", "Consum domèstic per càpita", "Domèstic xarxa", "Activitats econòmiques i fonts pròpies"],
  { 
    label: "Selecciona el tipus de consum",
    value: "Total"
  }
);
const selectorConsum = Generators.input(selectorConsumInput);
```

```js
let consum_daigua_per_comarca_filtre_any;
let consum_daigua_per_provincia_filtre_any;

if (selectorMapa === "Comarcal") {
  consum_daigua_per_comarca_filtre_any = consum_daigua_per_comarca_data
    .filter(d => d.Any == selectYear)
    .map(d => {
      return {
        Comarca: d["Comarca"],
        "Codi comarca": parseInt(d["Codi comarca"].toString().padStart(2, "0")),
        "Població": parseInt(d["Població"]),
        "Consum domèstic per càpita": parseInt(d["Consum domèstic per càpita"]),
        "Domèstic xarxa": parseInt(d["Domèstic xarxa"]),
        "Activitats econòmiques i fonts pròpies": parseInt(d["Activitats econòmiques i fonts pròpies"]),
        "Total": parseInt(d["Total"])
      };
    });
} else {
  consum_daigua_per_provincia_filtre_any = consum_daigua_per_provincia_data    
    .filter(d => d.Any == selectYear)
    .map(d => {
      return {
        "Província": d["Província"],
        "Codi província": parseInt(d["Codi província"].toString().padStart(2, "0")),
        "Població": parseInt(d["Població"]),
        "Consum domèstic per càpita": parseInt(d["Consum domèstic per càpita"]),
        "Domèstic xarxa": parseInt(d["Domèstic xarxa"]),
        "Activitats econòmiques i fonts pròpies": parseInt(d["Activitats econòmiques i fonts pròpies"]),
        "Total": parseInt(d["Total"])
      };
    });
}
```

```js
const nom_comarques = comarques_catalunya.features.map(d => d.properties.NOMCOMAR);
```

```js
const nom_provincies = provincies_catalunya.features.map(d => d.properties.NOMPROV);
```

```js
function set(input, value) {
    input.value = value;
    input.dispatchEvent(new Event("input", {bubbles: true}));
}
```

```js
const render_interaction_comarca = (index, scales, values, dimensions, context, next) => {
    const dom_element = next(index, scales, values, dimensions, context);
    const all_paths = dom_element.querySelectorAll("path");
    for (let i = 0; i < all_paths.length; i++) {
        all_paths[i].addEventListener("click", () => {
            set(comarcaProvinciaSeleccionadaInput, nom_comarques[index[i]]);
        });
    }
    return dom_element;
}
```

```js
const render_interaction_provincia = (index, scales, values, dimensions, context, next) => {
    const dom_element = next(index, scales, values, dimensions, context);
    const all_paths = dom_element.querySelectorAll("path");
    for (let i = 0; i < all_paths.length; i++) {
        all_paths[i].addEventListener("click", () => {
            set(comarcaProvinciaSeleccionadaInput, nom_provincies[index[i]]);
        });
    }
    return dom_element;
}
```

```js
function mapaChart(width, selectorMapa, selectorConsum, selectYear) {
  const data = (selectorMapa === "Comarcal") 
    ? consum_daigua_per_comarca_filtre_any 
    : consum_daigua_per_provincia_filtre_any;

  const isTotal = selectorConsum === "Total";
  const isPerCapita = selectorConsum === "Consum domèstic per càpita";
  const isOtherType = ["Domèstic xarxa", "Activitats econòmiques i fonts pròpies"].includes(selectorConsum);

  const unit = isTotal || isOtherType
    ? "M m³"
    : "L/persona/dia";

  let plot = (selectorMapa === "Provincial")
    ? Plot.plot({
        color: {
          type: "quantile",
          scheme: "Blues",
          label: `${selectorConsum} d'Aigua (${selectYear}) [${unit}]`,
          tickFormat: d => (isTotal || isOtherType) ? (d).toFixed(1) : d.toFixed(0),
          legend: true,
        },
        width,
        height: width,
        x: { axis: null },
        y: { axis: null },
        marks: [
          Plot.geo(provincies_catalunya, {
            fill: (d) => {
              const codiProvincia = d.properties.CODIPROV;
              const provincia = data.find(c => c["Codi província"] == codiProvincia);
              return provincia ? provincia[selectorConsum] / (isTotal || isOtherType ? 1e6 : 1) : null;
            },
            title: (d) => {
              const codiProvincia = d.properties.CODIPROV;
              const provincia = data.find(c => c["Codi província"] == codiProvincia);              
              if (!provincia) {
                return `${d.properties.NOMCOMAR} \nDades no disponibles`;
              }
              const isTotalOrOther = ["Total", "Domèstic xarxa", "Activitats econòmiques i fonts pròpies"].includes(selectorConsum);
              const unit = isTotalOrOther ? "M m³" : "L/persona/dia";
              const value = isTotalOrOther
                ? (provincia[selectorConsum] / 1e6).toFixed(2)
                : provincia[selectorConsum].toFixed(0);
              return `Comarca: ${d.properties.NOMPROV}\nPoblació: ${provincia["Població"]} habitants\n${selectorConsum}: ${value} ${unit}`;
            },
            tip: true,
            strokeOpacity: 1.0,
            strokeWidth: 1,
            stroke: "black",
            render: render_interaction_provincia
          })
        ]
    })  
    : Plot.plot({
        color: {
          type: "quantile",
          scheme: "Blues",
          label: `${selectorConsum} d'Aigua (${selectYear}) [${unit}]`,
          tickFormat: d => (isTotal || isOtherType) ? (d).toFixed(1) : d.toFixed(0),
          legend: true,
        },
        width,
        height: width,
        x: { axis: null },
        y: { axis: null },
        marks: [
          Plot.geo(comarques_catalunya, {
            fill: (d) => {
              const codiComarca = d.properties.CODICOMAR;
              const comarca = data.find(c => c["Codi comarca"] == codiComarca);
              return comarca ? comarca[selectorConsum] / (isTotal || isOtherType ? 1e6 : 1) : null;
            },
            title: (d) => {
              const codiComarca = d.properties.CODICOMAR;
              const comarca = data.find(c => c["Codi comarca"] == codiComarca);              
              if (!comarca) {
                return `${d.properties.NOMCOMAR} \nDades no disponibles`;
              }
              const isTotalOrOther = ["Total", "Domèstic xarxa", "Activitats econòmiques i fonts pròpies"].includes(selectorConsum);
              const unit = isTotalOrOther ? "M m³" : "L/persona/dia";
              const value = isTotalOrOther
                ? (comarca[selectorConsum] / 1e6).toFixed(2)
                : comarca[selectorConsum].toFixed(0);
              return `Comarca: ${d.properties.NOMCOMAR}\nPoblació: ${comarca["Població"]} habitants\n${selectorConsum}: ${value} ${unit}`;
            },
            tip: true,
            strokeOpacity: 1.0,
            strokeWidth: 0.5,
            stroke: "black",
            render: render_interaction_comarca
          })
        ]
    });
    d3.select(plot)
      .selectAll("path")
      .on("mouseover", function () {
          d3.select(this).attr("stroke-width", 2.0);
      })
      .on("mouseout", function () {
          d3.select(this).attr("stroke-width", 0.5);
      });

  d3.select(plot)
      .on("pointerenter", function () {
          d3.select(plot).selectAll("path").attr("stroke-width", 0.5);
      })
      .on("pointerleave", function () {
          d3.select(plot).selectAll("path").attr("stroke-width", 0.5);
      });  
    return plot;
}
```

<!--Bar chart top 10-->
```js
function barChart(width, selectorMapa, selectorConsum) {
  const data = (selectorMapa === "Comarcal") 
    ? consum_daigua_per_comarca_filtre_any 
    : consum_daigua_per_provincia_filtre_any;

  const sortedData = data.sort((a, b) => {
    const aValue = selectorConsum === "Consum Total" ? a.Total : a["Consum domèstic per càpita"];
    const bValue = selectorConsum === "Consum Total" ? b.Total : b["Consum domèstic per càpita"];
    return bValue - aValue;
  });

  const top10Data = sortedData.slice(0, 10);
  const maxValue = Math.max(...top10Data.map(d => selectorConsum === "Consum Total" ? d.Total : d["Consum domèstic per càpita"]));

  return Plot.plot({
    width,
    height: top10Data.length * 43,
    marginTop: 0,
    marginLeft: 140,
    marginRight: 40,
    style: "overflow: hidden;",
    color: {
      scheme: "Blues",
      domain: [0, maxValue], 
      type: "linear"
    },
    y: {
      label: selectorMapa === "Comarcal" ? "Comarca" : "Província",
      tickSize: 0
    },
    x: {
      label: selectorConsum === "Consum Total" ? "Consum Total (M m³)" : "Consum Domèstic per Càpita (L/persona/dia)", 
      grid: true,
      tickSize: 0,
      tickPadding: 2,
      domain: [0, maxValue * 1.1], // Extend slightly for spacing
      nice: true
    },
    marks: [
      Plot.barX(top10Data, {
        x: selectorConsum === "Consum Total" ? d => d.Total / 1e6 : "Consum domèstic per càpita", // Convert to M m³
        y: selectorMapa === "Comarcal" ? "Comarca" : "Província",
        fill: selectorConsum === "Consum Total" ? d => d.Total : d => d["Consum domèstic per càpita"], // ✅ Dynamically color by value
        sort: { y: "x", reverse: true, limit: 10 },
        tip: true,
        title: d => {
          const location = selectorMapa === "Comarcal" ? `Comarca: ${d.Comarca}` : `Província: ${d["Província"]}`;
          const value = selectorConsum === "Consum Total" 
            ? `Consum Total: ${(d.Total / 1e6).toFixed(2)} M m³` 
            : `Consum Domèstic Per Càpita: ${d["Consum domèstic per càpita"].toFixed(0)} L/persona/dia`;
          return `${location}\n${value}`;
        }
      })
    ]
  });
}
```

<!--Time series per comarca o província-->
```js
const comarcaProvinciaSeleccionadaInput = Inputs.select(
  selectorMapa == "Comarcal" ? 
  [...new Set(consum_daigua_per_comarca_data.map(d => d.Comarca))] 
  : [...new Set(consum_daigua_per_provincia_data.map(d => d["Província"]))], 
    selectorMapa == "Comarcal" ? 
  { label: "Selecciona una comarca" } : { label: "Selecciona una província" }
);
const comarcaProvinciaSeleccionada = Generators.input(comarcaProvinciaSeleccionadaInput);
```

```js
function lineChart(width, selectorMapa, comarcaProvinciaSeleccionada) {
  const data = (selectorMapa === "Comarcal") 
    ? consum_daigua_per_comarca_data.filter(d => d.Comarca === comarcaProvinciaSeleccionada) 
    : consum_daigua_per_provincia_data.filter(d => d["Província"] === comarcaProvinciaSeleccionada);

  // Ensure "Any" is a number
  const parsedData = data.map(d => ({
    ...d,
    Any: +d.Any // Convert to number (force type coercion)
  }));

  // Get max "Total" value for setting the y-axis range
  const maxTotal = Math.max(...parsedData.map(d => d.Total));

  return Plot.plot({
    width,
    marginLeft: 80,
    color: {
      domain: ["Domèstic xarxa", "Activitats econòmiques i fonts pròpies"],
      range: ["#377eb8", "#74add1"], // ✅ Shades of blue
      legend: true
    },
    marks: [
      // Domèstic xarxa Line
      Plot.line(parsedData, { 
        x: "Any", 
        y: "Domèstic xarxa", 
        stroke: "#377eb8", 
        strokeWidth: 3,
        tip: true
      }),
      // Activitats econòmiques i fonts pròpies Line
      Plot.line(parsedData, { 
        x: "Any", 
        y: "Activitats econòmiques i fonts pròpies", 
        stroke: "#74add1", 
        strokeWidth: 3,
        tip: true,
      })
    ],
    x: { label: "Any", grid: true },
    y: { 
      label: "Consum (m³)", 
      grid: true, 
      domain: [0, maxTotal], // ✅ Ensures y-axis starts at 0 and goes up to max "Total"
      ticks: 6 // ✅ Adjusts the number of tick marks for better readability
    }
  });
}
```

<!--Taula de dades-->
```js
const agregaProvincia = Inputs.checkbox([""], {label: "Agrega per província"});
const agregaProvinciaValue = Generators.input(agregaProvincia);
```
```js
const tableSearch = Inputs.search(agregaProvinciaValue.length == 1 ? consum_daigua_per_provincia_data : consum_daigua_per_comarca_data);
const tableSearchValue = view(tableSearch);
```

<div class="grid grid-cols-4">
  <div class="card grid-colspan-3">
    <h1>Consum d'aigua a Catalunya</h1>
  </div>
  <div class="card grid-colspan-1">
    <h2 class="text-lg font-semibold">Selecciona l'any desitjat</h2>
    ${selectYearInput}   
  </div>
</div>

<div class="grid grid-cols-4 gap-4 p-4">  
  <!-- Consum Mitjà Anual a Catalunya -->
  <div class="card p-4 text-center">
    <h2 class="text-lg font-semibold">Consum Mitjà Anual a Catalunya</h2>
    <span class="big text-2xl font-bold">${consumMitjaAny.toFixed(0)} m³</span>
  </div>  
  <!-- Total Consum d'Aigua (selectYear) -->
  <div class="card p-4 flex flex-col justify-between">
    <div class="grid grid-cols-4 items-center">
      <h2 class="grid-colspan-3" text-lg font-semibold">Total Consum d'Aigua (${selectYear})</h2>
    </div>
    <div class="text-center mt-2">
      <span class="big text-2xl font-bold">${totalConsumCatalunya.toFixed(0)} m³</span>
      ${Trend(diferenciaPercent.toFixed(2))}
      <span class="muted text-sm block">% respecte la mitjana anual</span>
    </div>
  </div>  

  <!-- Consum Domèstic Per Capita Mitjà Anual a Catalunya -->
  <div class="card p-4 text-center">
    <h2 class="text-lg font-semibold">Consum Domèstic Per Capita Mitjà Anual a Catalunya</h2>
    <span class="big text-2xl font-bold">${consumPerCapitaMitjaAny.toFixed(0)} m³</span>
  </div>  
  <!-- Total Consum Domèstic Per Capita d'Aigua (selectYear) -->
  <div class="card p-4 flex flex-col justify-between">
    <div class="grid grid-cols-4 items-center">
      <h2 class="grid-colspan-3" text-lg font-semibold">Total Consum Domèstic Per Capita d'Aigua (${selectYear})</h2>
    </div>
    <div class="text-center mt-2">
      <span class="big text-2xl font-bold">${totalConsumPerCapitaCatalunya.toFixed(0)} m³</span>
      ${Trend(diferenciaPercent_1.toFixed(2))}
      <span class="muted text-sm block">% respecte la mitjana anual</span>
    </div>
  </div> 
</div>

<div>
  <div class="grid grid-cols-2">
    <!--Mapa-->
    <div class="card">
      <h1>Mapa Comarcal de Consums d'Aigua (${selectYear})</h1>
      <h2>${selectorConsum} 
      ${selectorMapa == "Comarcal" ? "per comarca" : "per província"}
      </h2>      
      ${selectorConsumInput}
      ${selectorMapaInput}    
      ${resize((width) => mapaChart(width, selectorMapa, selectorConsum, selectYear))}
    </div>   
    <div class="grid grid-rows-2"> 
      <!--Bar chart-->
      <div class="card">
        <h1>Top ${selectorMapa == "Comarcal" ? "10 Comarques" : "Províncies"}</h1>
        <h2>Segons ${selectorConsum == "Consum Total" ? "consum total" : "consum domèstic per càpita"}</h2>
        ${resize((width) => barChart(width, selectorMapa, selectorConsum))}
      </div> 
      <!--Line chart-->
      <div class="card">
        ${comarcaProvinciaSeleccionadaInput}
        ${resize((width) => lineChart(width, selectorMapa, comarcaProvinciaSeleccionada))}
      </div>                     
    </div>
  </div>  
</div>

<!--Taula de dades-->
<div class="card">
  <div>
    <h1>Consum d'Aigua</h1>
    <h2>Filtra per ${agregaProvinciaValue.length == 1 ? "Província" : "Comarca"}</h2>
    ${agregaProvincia}
    <p>Entra un nom de ${agregaProvinciaValue.length == 1 ? "província" : "comarca"}:</p>
    ${display(tableSearch)}
  </div>
  ${display(Inputs.table(tableSearchValue, {
    columns: [      
      agregaProvinciaValue.length == 1 ? "Província" : "Comarca",
      "Any", 
      "Població", 
      "Domèstic xarxa", 
      "Activitats econòmiques i fonts pròpies", 
      "Consum domèstic per càpita", 
      "Total"
    ]
  }))}  
</div>
