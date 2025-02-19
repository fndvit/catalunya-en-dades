---
title: Consum d’energia elèctrica per municipis i sectors de Catalunya 
toc: false
style: ../dashboard.css

---

<!-- Dades consum energia electrica catalunya i metadades-->
```js
const consum_energia_electrica_data = FileAttachment("data/dades.json").json();
const metadades_info = FileAttachment("data/metadades.json").json();
```

<!-- Metadades -->
```js
const lastUpdated = metadades_info["last_updated_data"];
const attribution = metadades_info["attribution"];
const view_count = metadades_info["view_count"];
const download_count = metadades_info["download_count"];
const license = metadades_info["license"];
```

<!--Seleccionable d'anys  -->
```js
// Llista d'anys per seleccionar
const years = Array.from(new Set(consum_energia_electrica_data.map(d => d.any))).sort((a, b) => b - a);
// Select per anys
const selectYearInput = Inputs.select(years, { label: "Selecciona un any" });
const selectYear = Generators.input(selectYearInput);
```

<!--Calcular el consum total de electricitat a Catalunya per l'any seleccionat (en TWh)  -->
```js
// Funció para obtenir les dades filtrades per l'any seleccionat
function getDataForSelectedYear(year) {
  return consum_energia_electrica_data.filter(d => d.any === year);
}

// Calcular el consum total de electricitat a Catalunya per l'any seleccionat (en TWh)
function calculateTotalConsumption(year) {
  const lastYearData = getDataForSelectedYear(year);
  const totalConsumptionKWh = d3.sum(lastYearData, d => parseFloat(d["consum_kwh"]));
  const totalConsumptionTWh = totalConsumptionKWh / 1000000000;  // Convertir de kWh a TWh
  const totalConsumptionTWhFormatted = totalConsumptionTWh.toFixed(2);
  return totalConsumptionTWhFormatted;
}

const totalConsumption = calculateTotalConsumption(selectYear);
```

<!--Calcular el sector i el municipi amb el major i menor consum d'energia per l'any seleccionat -->
```js
// Funció per calcular el sector i el municipi amb el major i menor consum d'energia per l'any seleccionat
function calculateMaxMinConsumptionWithPercentage(year) {
  const lastYearData = getDataForSelectedYear(year);

  // Agrupar per sector i sumar el consum total per cada sector
  const totalConsumptionBySector = d3.rollup(
    lastYearData, 
    v => d3.sum(v, d => parseFloat(d["consum_kwh"])), 
    d => d.descripcio_sector 
  );

  // Calcular el consum total
  const totalConsumption = d3.sum(Array.from(totalConsumptionBySector.values()));

  // Trobar el sector amb el major consum
  const maxConsumptionSector = d3.max(Array.from(totalConsumptionBySector.values()));  
  const maxSector = [...totalConsumptionBySector].find(([key, value]) => value === maxConsumptionSector);

  // Trobar el sector amb el menor consum
  const minConsumptionSector = d3.min(Array.from(totalConsumptionBySector.values()));
  const minSector = [...totalConsumptionBySector].find(([key, value]) => value === minConsumptionSector);

  // Calcular el percentatge de consum per al sector amb més consum
  const maxSectorPercentage = ((maxConsumptionSector / totalConsumption) * 100).toFixed(2);

  // Calcular el percentatge de consum per al sector amb menys consum
  const minSectorPercentage = ((minConsumptionSector / totalConsumption) * 100).toFixed(2);

  // Agrupar per municipi i sumar el consum total per cada municipi
  const totalConsumptionByMunicipi = d3.rollup(
    lastYearData, 
    v => d3.sum(v, d => parseFloat(d["consum_kwh"])), 
    d => d.municipi
  );

  // Trobar el municipi amb el major consum
  const maxConsumptionMunicipi = d3.max(Array.from(totalConsumptionByMunicipi.values()));  
  const maxMunicipi = [...totalConsumptionByMunicipi].find(([key, value]) => value === maxConsumptionMunicipi);  

  // Trobar el municipi amb el menor consum
  const minConsumptionMunicipi = d3.min(Array.from(totalConsumptionByMunicipi.values()));
  const minMunicipi = [...totalConsumptionByMunicipi].find(([key, value]) => value === minConsumptionMunicipi);

  // Convertir el consum de kWh a TWh (teravatios hora) i redondejar a 2 decimals
  const maxConsumptionInTWh = (maxConsumptionMunicipi / 1000000000).toFixed(2);
  const minConsumptionInTWh = (minConsumptionMunicipi / 1000000000).toFixed(2);

  return { 
    maxSectorName: maxSector[0], 
    maxSectorPercentage: maxSectorPercentage, 
    minSectorName: minSector[0], 
    minSectorPercentage: minSectorPercentage,
    maxMunicipiName: maxMunicipi[0], 
    maxConsumptionMun: maxConsumptionInTWh, 
    minMunicipiName: minMunicipi[0], 
    minConsumptionMun: minConsumptionInTWh
  };
}

const { 
  maxSectorName, 
  maxSectorPercentage, 
  minSectorName, 
  minSectorPercentage,
  maxMunicipiName, 
  maxConsumptionMun, 
  minMunicipiName, 
  minConsumptionMun 
} = calculateMaxMinConsumptionWithPercentage(selectYear);

```

<!--Informació dels municipis -->
```js
// Llista dels municipis ordenats
const municipisOrdered = Array.from(new Set(consum_energia_electrica_data.map(d => d.municipi))).sort();
// Crear el select pels municipis
const selectMunicipiInput = Inputs.select(municipisOrdered, { label: "Selecciona un municipi" });
// Municipi seleccionat
let lastSelectedMunicipi = selectMunicipiInput.value;

// Calcular el percentatge de variació de consum respecte any anterior
function getConsumptionComparison(consumoAnualData, selectYear) {
  const selectedYear = parseInt(selectYear);
  // Dades del any seleccionat i anterior
  const selectedYearData = consumoAnualData.find(d => parseInt(d.year) === selectedYear);
  const previousYearData = consumoAnualData.find(d => parseInt(d.year) === selectedYear - 1);
  if (!previousYearData) {
    return -1;
  }
  const difference = selectedYearData.totalConsumption - previousYearData.totalConsumption;
  const percentageChange = ((difference / previousYearData.totalConsumption) * 100).toFixed(2);
  const previousYear = selectedYear-1
  return percentageChange;
}

// Funció per calcular el consum total per municipi i any seleccionat
function calculateTotalConsumptionMun(municipi, selectYear) {
  const selectedYearData = consum_energia_electrica_data.filter(d => d.any === selectYear);
  const groupedByMunicipi = selectedYearData.reduce((acc, d) => {
    acc[d.municipi] = (acc[d.municipi] || 0) + parseFloat(d.consum_kwh);
    return acc;
  }, {});
  return ((groupedByMunicipi[municipi] || 0) / 1000000).toFixed(2); // Convertir a GWh
}

// Funció per obtenir el sector amb major consum per municipi i any
function getMaxSectorMun(municipi, selectYear) {
  const datosMunicipi = consum_energia_electrica_data.filter(d => d.municipi === municipi && d.any === selectYear);

  // Agrupar el consum total per sector en GWh
  const consumoPorAnoYSector = d3.rollup(
    datosMunicipi,
    v => d3.sum(v, d => d.consum_kwh) / 1000000, // Convertir a GWh
    d => d.descripcio_sector
  );
  // Trobar el sector amb major consum
  return Array.from(consumoPorAnoYSector.entries()).reduce((max, curr) => 
    curr[1] > max[1] ? curr : max, ["", -Infinity]
  );
}

// Funció para actualitzar la informació del municipi seleccionat
function updateConsumption() {
  const municipiSelected = selectMunicipiInput.value;
  lastSelectedMunicipi = municipiSelected;

  const datosMunicipi = consum_energia_electrica_data.filter(d => d.municipi === lastSelectedMunicipi);
  const consumoAnual = d3.rollup(
    datosMunicipi,
    v => d3.sum(v, d => d.consum_kwh)/ 1000000,  // Convertir a GWh
    d => d.any
  );
  const consumoAnualData = Array.from(consumoAnual, ([year, totalConsumption]) => ({ year, totalConsumption }));

  // Funció per calcular el consum total per municipi i any seleccionat
  const totalConsumptionMun = calculateTotalConsumptionMun(municipiSelected, selectYear);
  // Funció per obtenir el sector amb major consum per municipi i any
  const [maxSectorNameMun, maxSectorConsumption] = getMaxSectorMun(municipiSelected, selectYear);
  // Calcular el percentatge de variació de consum respecte any anterior
  const percentageChangeConsum = getConsumptionComparison(consumoAnualData, selectYear);

  document.getElementById("totalConsumptionMun").innerText = `${totalConsumptionMun} GWh`;
  document.getElementById("municipiSelectedName").innerText = `${municipiSelected} (${selectYear})`;

  // Comprobar si el valor es -1 (que indica que no hi ha dades a comparar)
  if (percentageChangeConsum === -1) {
    document.getElementById("percentageChangeMun").innerText = "No disponible";
  } else {
    document.getElementById("percentageChangeMun").innerText = `${percentageChangeConsum}%`;
    if (percentageChangeConsum > 0) {
      document.getElementById("percentageChangeMun").style.color = "green"; // Color verd per variació positiva
    } else {
      document.getElementById("percentageChangeMun").style.color = "red"; // Color vermell per variació negativa
    }
  }
  document.getElementById("sectorMunMaxConsum").innerText = `${maxSectorNameMun} (${maxSectorConsumption.toFixed(2)} GWh)`;
}

// Funció per actualitzar el municipi al cambiar d'any
function updateMunicipiOnYearChange() {
  selectMunicipiInput.value = lastSelectedMunicipi;
  updateConsumption();
}

selectMunicipiInput.addEventListener("change", updateConsumption);
selectYearInput.addEventListener("change", updateMunicipiOnYearChange);

// Inicializar la informació
updateConsumption();
```

<!-- Gràfic de línies del consum pel municipi seleccionat al llarg dels anys  -->
```js
// Funció per actualitzar el gráfic
function actualizarGrafico() {
  const municipiSeleccionat = selectMunicipiInput.value;
  const datosMunicipi = consum_energia_electrica_data.filter(d => d.municipi === municipiSeleccionat);

  // Consum total per any
  const consumoAnual = d3.rollup(
    datosMunicipi,
    v => d3.sum(v, d => d.consum_kwh)/1000000, // Sumar el consum per año i convertir a GWH
    d => d.any // Agrupar por año
  );
  const consumoAnualData = Array.from(consumoAnual, ([year, totalConsumption]) => ({ year, totalConsumption }));
  // Obtenir els anys de les dades
  const allYears = [...new Set(consumoAnualData.map(d => d.year))];
  // Crear el gràfic
  const chartMun = Plot.plot({
    width,
    marginLeft: 100,
    height: width > 1280 ? 1280 : 360,  // Ajustar altura en función del ancho
    x: {
      label: "Any",
      domain: allYears,  // Domini dels anys
      grid: true
    },
    y: {
      label: "Consum total (GWh)",
      grid: true,
      tickFormat: d => { 
        const formatter = new Intl.NumberFormat('es-ES');  // Numeració en format espanyol
        return formatter.format(d);
      }
    },
    style: "overflow: visible;",
    marks: [
      Plot.line(
        consumoAnualData,
        {
          x: "year",
          y: "totalConsumption",
          stroke: "#003f87",  // Color gris per la línia bàsica
          strokeWidth: 3,
          tip: d => {
            const formatter = new Intl.NumberFormat('es-ES');  // Numeració en format espanyol
            return `${formatter.format(d.totalConsumption)} GWh`;
          },
        }
      ),
    ]
  });

  // Contenidor del gràfic
  const chartContainer = document.getElementById("chartMun");
  // Eliminar el gràfic anterior abans d'afegir un de nou
  chartContainer.innerHTML = "";
  // Afegir el nou gràfic
  chartContainer.appendChild(chartMun);
}

// Llamar a la función de actualización cuando cambie el municipio
selectMunicipiInput.addEventListener("change", actualizarGrafico);

// Llamar a la función para cargar el gráfico inicial
actualizarGrafico();
```

<!-- Obtenir el nom del sector amb més consum del municipi i any seleccionat -->
```js
const dataForSelectedYearMun = consum_energia_electrica_data.filter(d => d.municipi === selectMunicipiInput.value && d.any === selectYear);
 // Agrupar per sector i calcular el consum total en GWh
const consumptionBySectorMun = d3.rollup(
  dataForSelectedYearMun,
  v => d3.sum(v, d => d.consum_kwh) / 1000000,  // Convertir de kWh a GWh
  d => d.descripcio_sector
);
const consumptionArray = Array.from(consumptionBySectorMun);
const maxSectorEntry = consumptionArray.reduce((max, curr) => curr[1] > max[1] ? curr : max, consumptionArray[0]);
const maxMunSectorName = maxSectorEntry[0];  // Nom del sector
const maxSectorConsumption = parseFloat(maxSectorEntry[1].toFixed(2));  // Consum en GWh
```

<!-- Gràfic de barres del consum total per sectors segons any seleccionat -->
```js
function getDataForYear(year) {
  return consum_energia_electrica_data.filter(d => d.any === year);
}
const dataForSelectedYear = getDataForYear(selectYear);
const consumptionBySector = d3.rollup(
  dataForSelectedYear,
  v => d3.sum(v, d => parseFloat(d.consum_kwh)) / 1000000000,  // Convertir de kWh a TWh
  d => d.descripcio_sector
);
const consumptionData = Array.from(consumptionBySector, ([sector, consum]) => ({ sector, consum }));
const chart = Plot.plot({
  marginLeft: 180,
  marginRight: 60,
  title: "",
  color: { 
    type: "linear",
    domain: [0, d3.max(consumptionData, d => d.consum)],
    range: ["#aee0f3", "#003f87"]
  },
  x: { label: "Consum (TWh)", tickFormat: ",.2f" },
  y: { label: "Sector" },
  grid: true,
  marks: [
    Plot.barX(consumptionData, {
      x: "consum",
      y: "sector",
      sort: { y: "x", reverse: true },
      fill: d => d3.scaleLinear().domain([0, d3.max(consumptionData, d => d.consum)]).range(["#aee0f3", "#003f87"])(d.consum)
    }),
    Plot.text(consumptionData, {
      text: d => `${d.consum.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TWh`,
      x: "consum",
      y: "sector",
      textAnchor: "start",
      dx: 5,
      fill: "black"
    })
  ],
  style: { width: 600, height: 400 }
});

// Contenidor del gràfic
const chartContainer = document.getElementById("chart");
// Eliminar el gràfic anterior
chartContainer.innerHTML = "";
// Afegir el nou gràfic
chartContainer.appendChild(chart);
```

<div class="grid grid-cols-4">
  <div class="grid-colspan-3">
    <h1>Consum d’energia elèctrica per municipis i sectors de Catalunya</h1>
    <h2 id="last-updated">Dades actualitzades a ${lastUpdated}</h2>
  </div>
  <!-- Columna para la nota sobre conversión -->
  <div class="col-span-1 bg-gray-100 p-4 border border-gray-300 rounded">
    <ul>
      <p>1 TWh = 1.000.000.000 kWh</p>
      <p>1 GWh = 1.000.000 kWh</p>
      <p>1 MWh = 1.000 kWh</p>
    </ul>
  </div>
</div>

<div class="grid-colspan-1">${selectYearInput}</div>
<div class="grid grid-cols-4">  

  <!-- Consum total d'energia elèctrica a Catalunya -->
  <div class="card">
    <h3 class="consum-total-energia-electrica">Consum elèctric total a Catalunya</h3>
    <span class="big grid-colspan-4">${totalConsumption} TWh</span>
  </div> 

 <!-- Municipi amb més consum elèctric -->
  <div class="card">
    <h3 class="municipi-consum-electric">Municipi amb més consum</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: baseline;">
        <div class="big">${maxMunicipiName}</div>
        <div class="blue"><strong>${maxConsumptionMun} TWh</strong></div>
    </div>
  </div>
 
  
  <!-- Sector més consumidor d'energia elèctrica -->
  <div class="card">
      <h3 class="sector-mes-energia">Sector amb més consum </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: baseline;">
        <div class="big">${maxSectorName}</div>
        <div class="blue"><strong>${maxSectorPercentage} %</strong></div>
      </div>
  </div>  
   
<!-- Sector menys consumidor d'energia elèctrica -->
  <div class="card">
      <h3 class="sector-menys-energia">Sector amb menys consum </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: baseline;">
        <div class="big">${minSectorName}</div>
        <div class="blue"><strong>${minSectorPercentage} %</strong></div>
      </div>
  </div>  
</div>

<!-- Mapa per comarques i municipis segons el consum total per sector i any seleccionat -->
<div class="grid grid-cols-2 gap-4 mt-4">
  <div class="card p-4">
    <h2>Mapa per comarques i municipis</h2>
    <p></p>
  </div>
  <div class="card p-4">
    <h2> Consum d'energia elèctrica per sector </h2>
    <div id="chart" class="col-span-2"></div>
  </div>
</div>

<!-- Informació dels municipis -->
<div class="card grid grid-cols-4">
  <div class="col-span-2" style="max-height:200px;">
    <div id="selectMunicipiContainer">${selectMunicipiInput}</div>
    <!-- Mostra el nom del municipi seleccionat -->
    <h1 style="padding-top:1rem" id="municipiSelectedName">${selectMunicipiOrdered}</h1>
    <!-- Mostra la data de l'última actualització -->
    <h3 id="last-updated">Dades actualitzades a ${lastUpdated}</h3>
    <!-- Mostra el consum total calculat -->
    <p style="margin: 1rem 0 0 0; padding: 0">
      <b>Consum total d'energia:</b> <span id="totalConsumptionMun">${totalConsumptionMun}</span>
    </p>
    <!-- Mostra el sector amb major consum del municipi-->
    <p style="margin: 1rem 0 0 0; padding: 0">
      <b>Sector més consum:</b> <span id="sectorMunMaxConsum"></span>
    </p>
    <!-- Mostra la variació percentual respecte l'any anterior del municipi seleccionat-->
    <p style="margin: 1rem 0 0 0; padding: 0">
      <b>Variació percentual respecte l'any anterior:</b> <span id="percentageChangeMun"></span>
    </p>
  </div>
  <div id="chartMun" class="col-span-2" style="height: 250px;"></div> <!-- Columna derecha para el gráfico con altura ajustada -->
</div>


<p class="notes">Desenvolupat per en <strong>Marc Serrano Touil</strong>. Aquest panell de dades és una nova visualització del consum d’energia elèctrica per municipis i sectors de Catalunya</a> de l'${attribution}, utilitzant les <a href="https://analisi.transparenciacatalunya.cat/Energia/Consum-d-energia-el-ctrica-per-municipis-i-sectors/8idm-becu/about_data">dades obertes disponibles</a> al portal de Transparència. Tota la informació es comparteix sota la llicència 
  <a href="https://administraciodigital.gencat.cat/ca/dades/dades-obertes/informacio-practica/llicencies/" target="_blank">llicència oberta</a>.</p>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">

  <i class="fa-solid fa-eye"></i> ${view_count} visualitzacions &nbsp;&nbsp; 
  <i class="fa-solid fa-download"></i> ${download_count} descàrregues