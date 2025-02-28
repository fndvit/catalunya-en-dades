---
title: Consum d’energia elèctrica per municipis i sectors de Catalunya 
toc: false
style: ../dashboard.css

---
<script src="https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/simple-statistics@7.8.0/dist/simple-statistics.min.js"></script>

<!-- Dades consum energia electrica catalunya i metadades-->
```js
const consum_energia_electrica_data = FileAttachment("data/dades.json").json();
const metadades_info = FileAttachment("data/metadades.json").json();
const poblacio_municipis = FileAttachment("data/poblacio_municipis.csv").csv();
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

```js
const poblacioMun=poblacio_municipis.map(item => {
  // Eliminar el últim dígit de codimun
  return {
    ...item,
    codimun: item.codimun.slice(0, -1)
  };
});
// Obtenir la població de cada municipi
const poblacionFiltrada = poblacioMun.filter(item => item.any === "2013");
```

<!-- Seleccionables pel mapa de sectors i opció de distribució municipal/comarcal -->
```js
const sectorOptions = [...new Set(consum_energia_electrica_data.map(item => item.descripcio_sector))];
const selectorSectorInput = Inputs.select(sectorOptions, { 
  label: "Selecciona el tipus de sector",
  value: "Transport"
});
// Obtenir el valor seleccionat del seleccionable de sectors
const selectorSector = Generators.input(selectorSectorInput);
```

<!-- Dades de consum de energia per municipi -->
```js
function groupBySectorAndMunicipi(sector, selectedYear) {
  const dataPert = consum_energia_electrica_data.filter(d => d.descripcio_sector === sector);
  // Filtrar les dades per sector i any
  const dataFiltered = consum_energia_electrica_data.filter(d => 
    d.descripcio_sector === sector && String(d.any) === String(selectedYear)
  );

  const groupedData = d3.rollup(
    dataFiltered,
    v => d3.sum(v, d => parseFloat(d.consum_kwh)), // Sumem el consum
    d => d.any, // Agrupar per any
    d => d.cdmun // Agrupar per municipi
  );
  return groupedData;
}

const consumptionByMunicipi = groupBySectorAndMunicipi(selectorSector, selectYear);
function normalizeDataForMap(consumptionByMunicipi, poblacioFiltrada) {
  const normalizedData = [];
  const poblacioMap = {};
  poblacioFiltrada.forEach((item) => {
    poblacioMap[item.codimun] = parseInt(item.poblacio, 10);
  });
  // Normalitzar les dades
  consumptionByMunicipi.forEach((municipiData, year) => {
    municipiData.forEach((consumption, municipality) => {
      // Verificar que existeix la població pel municipi
      const population = poblacioMap[municipality];
      if (population && consumption > 0) { // Evitar valors nuls o negatius
        const normalizedConsumption = consumption / population; // Normalitzar per població
        normalizedData.push({
          year: year,
          codimun: municipality,
          consumption: normalizedConsumption
        });
      } else {
        // Si no hi ha població o no hi ha consum, es pot omitir o posar 0
        normalizedData.push({
          year: year,
          codimun: municipality,
          consumption: 0
        });
      }
    });
  });
  return normalizedData;
}

// Escoltar als canvis en el select i actualitzar el mapa
selectorSectorInput.addEventListener("change", groupBySectorAndMunicipi);
const normalizedData = normalizeDataForMap(consumptionByMunicipi, poblacionFiltrada);
// Taula de municipis amb el idescat i ine, per poder associar cada codi de municipi amb el seu idescat
const muni_table = [
  { idescat: "250019", ine: "25001", nom: "Abella de la Conca" },
  { idescat: "080018", ine: "08001", nom: "Abrera" },
  { idescat: "250024", ine: "25002", nom: "Àger" },
  { idescat: "250030", ine: "25003", nom: "Agramunt" },
  { idescat: "080023", ine: "08002", nom: "Aguilar de Segarra" },
  { idescat: "170010", ine: "17001", nom: "Agullana" },
  { idescat: "080142", ine: "08014", nom: "Aiguafreda" },
  { idescat: "430017", ine: "43001", nom: "Aiguamúrcia" },
  { idescat: "170025", ine: "17002", nom: "Aiguaviva" },
  { idescat: "250387", ine: "25038", nom: "Aitona" },
  { idescat: "250045", ine: "25004", nom: "Alamús, els" },
  { idescat: "250058", ine: "25005", nom: "Alàs i Cerc" },
  { idescat: "250061", ine: "25006", nom: "Albagés, l'" },
  { idescat: "170031", ine: "17003", nom: "Albanyà" },
  { idescat: "250077", ine: "25007", nom: "Albatàrrec" },
  { idescat: "250083", ine: "25008", nom: "Albesa" },
  { idescat: "250096", ine: "25009", nom: "Albi, l'" },
  { idescat: "430022", ine: "43002", nom: "Albinyana" },
  { idescat: "430038", ine: "43003", nom: "Albiol, l'" },
  { idescat: "170046", ine: "17004", nom: "Albons" },
  { idescat: "430043", ine: "43004", nom: "Alcanar" },
  { idescat: "250100", ine: "25010", nom: "Alcanó" },
  { idescat: "250117", ine: "25011", nom: "Alcarràs" },
  { idescat: "250122", ine: "25012", nom: "Alcoletge" },
  { idescat: "430056", ine: "43005", nom: "Alcover" },
  { idescat: "439044", ine: "43904", nom: "Aldea, l'" },
  { idescat: "430069", ine: "43006", nom: "Aldover" },
  { idescat: "430075", ine: "43007", nom: "Aleixar, l'" },
  { idescat: "080039", ine: "08003", nom: "Alella" },
  { idescat: "430081", ine: "43008", nom: "Alfara de Carles" },
  { idescat: "250138", ine: "25013", nom: "Alfarràs" },
  { idescat: "250143", ine: "25014", nom: "Alfés" },
  { idescat: "430094", ine: "43009", nom: "Alforja" },
  { idescat: "250156", ine: "25015", nom: "Algerri" },
  { idescat: "250169", ine: "25016", nom: "Alguaire" },
  { idescat: "250175", ine: "25017", nom: "Alins" },
  { idescat: "430108", ine: "43010", nom: "Alió" },
  { idescat: "250194", ine: "25019", nom: "Almacelles" },
  { idescat: "250208", ine: "25020", nom: "Almatret" },
  { idescat: "250215", ine: "25021", nom: "Almenar" },
  { idescat: "430115", ine: "43011", nom: "Almoster" },
  { idescat: "250220", ine: "25022", nom: "Alòs de Balaguer" },
  { idescat: "170062", ine: "17006", nom: "Alp" },
  { idescat: "080044", ine: "08004", nom: "Alpens" },
  { idescat: "250236", ine: "25023", nom: "Alpicat" },
  { idescat: "250241", ine: "25024", nom: "Alt Àneu" },
  { idescat: "430120", ine: "43012", nom: "Altafulla" },
  { idescat: "170078", ine: "17007", nom: "Amer" },
  { idescat: "430136", ine: "43013", nom: "Ametlla de Mar, l'" },
  { idescat: "080057", ine: "08005", nom: "Ametlla del Vallès, l'" },
  { idescat: "439060", ine: "43906", nom: "Ampolla, l'" },
  { idescat: "430141", ine: "43014", nom: "Amposta" },
  { idescat: "170084", ine: "17008", nom: "Anglès" },
  { idescat: "250273", ine: "25027", nom: "Anglesola" },
  { idescat: "250292", ine: "25029", nom: "Arbeca" },
  { idescat: "430167", ine: "43016", nom: "Arboç, l'" },
  { idescat: "430154", ine: "43015", nom: "Arbolí" },
  { idescat: "170097", ine: "17009", nom: "Arbúcies" },
  { idescat: "080060", ine: "08006", nom: "Arenys de Mar" },
  { idescat: "080076", ine: "08007", nom: "Arenys de Munt" },
  { idescat: "170101", ine: "17010", nom: "Argelaguer" },
  { idescat: "080082", ine: "08008", nom: "Argençola" },
  { idescat: "430173", ine: "43017", nom: "Argentera, l'" },
  { idescat: "080095", ine: "08009", nom: "Argentona" },
  { idescat: "170118", ine: "17011", nom: "Armentera, l'" },
  { idescat: "430189", ine: "43018", nom: "Arnes" },
  { idescat: "250313", ine: "25031", nom: "Arres" },
  { idescat: "250328", ine: "25032", nom: "Arsèguel" },
  { idescat: "080109", ine: "08010", nom: "Artés" },
  { idescat: "250334", ine: "25033", nom: "Artesa de Lleida" },
  { idescat: "250349", ine: "25034", nom: "Artesa de Segre" },
  { idescat: "430192", ine: "43019", nom: "Ascó" },
  { idescat: "250365", ine: "25036", nom: "Aspa" },
  { idescat: "250371", ine: "25037", nom: "Avellanes i Santa Linya, les" },
  { idescat: "080116", ine: "08011", nom: "Avià" },
  { idescat: "080121", ine: "08012", nom: "Avinyó" },
  { idescat: "170123", ine: "17012", nom: "Avinyonet de Puigventós" },
  { idescat: "080137", ine: "08013", nom: "Avinyonet del Penedès" },
  { idescat: "080155", ine: "08015", nom: "Badalona" },
  { idescat: "089045", ine: "08904", nom: "Badia del Vallès" },
  { idescat: "080168", ine: "08016", nom: "Bagà" },
  { idescat: "250390", ine: "25039", nom: "Baix Pallars" },
  { idescat: "250404", ine: "25040", nom: "Balaguer" },
  { idescat: "080174", ine: "08017", nom: "Balenyà" },
  { idescat: "080180", ine: "08018", nom: "Balsareny" },
  { idescat: "430206", ine: "43020", nom: "Banyeres del Penedès" },
  { idescat: "170157", ine: "17015", nom: "Banyoles" },
  { idescat: "250411", ine: "25041", nom: "Barbens" },
  { idescat: "430213", ine: "43021", nom: "Barberà de la Conca" },
  { idescat: "082520", ine: "08252", nom: "Barberà del Vallès" },
  { idescat: "080193", ine: "08019", nom: "Barcelona" },
  { idescat: "250426", ine: "25042", nom: "Baronia de Rialb, la" },
  { idescat: "170160", ine: "17016", nom: "Bàscara" },
  { idescat: "250447", ine: "25044", nom: "Bassella" },
  { idescat: "430228", ine: "43022", nom: "Batea" },
  { idescat: "250450", ine: "25045", nom: "Bausen" },
  { idescat: "080207", ine: "08020", nom: "Begues" },
  { idescat: "170139", ine: "17013", nom: "Begur" },
  { idescat: "250463", ine: "25046", nom: "Belianes" },
  { idescat: "250485", ine: "25048", nom: "Bell-lloc d'Urgell" },
  { idescat: "251706", ine: "25170", nom: "Bellaguarda" },
  { idescat: "170182", ine: "17018", nom: "Bellcaire d'Empordà" },
  { idescat: "250479", ine: "25047", nom: "Bellcaire d'Urgell" },
  { idescat: "250498", ine: "25049", nom: "Bellmunt d'Urgell" },
  { idescat: "430234", ine: "43023", nom: "Bellmunt del Priorat" },
  { idescat: "080214", ine: "08021", nom: "Bellprat" },
  { idescat: "250501", ine: "25050", nom: "Bellpuig" },
  { idescat: "430249", ine: "43024", nom: "Bellvei" },
  { idescat: "250518", ine: "25051", nom: "Bellver de Cerdanya" },
  { idescat: "250523", ine: "25052", nom: "Bellvís" },
  { idescat: "250539", ine: "25053", nom: "Benavent de Segrià" },
  { idescat: "430252", ine: "43025", nom: "Benifallet" },
  { idescat: "430265", ine: "43026", nom: "Benissanet" },
  { idescat: "080229", ine: "08022", nom: "Berga" },
  { idescat: "170195", ine: "17019", nom: "Besalú" },
  { idescat: "170209", ine: "17020", nom: "Bescanó" },
  { idescat: "170216", ine: "17021", nom: "Beuda" },
  { idescat: "080235", ine: "08023", nom: "Bigues i Riells del Fai" },
  { idescat: "250557", ine: "25055", nom: "Biosca" },
  { idescat: "170221", ine: "17022", nom: "Bisbal d'Empordà, la" },
  { idescat: "430271", ine: "43027", nom: "Bisbal de Montsant, la" },
  { idescat: "430287", ine: "43028", nom: "Bisbal del Penedès, la" },
  { idescat: "172348", ine: "17234", nom: "Biure" },
  { idescat: "430290", ine: "43029", nom: "Blancafort" },
  { idescat: "170237", ine: "17023", nom: "Blanes" },
  { idescat: "170293", ine: "17029", nom: "Boadella i les Escaules" },
  { idescat: "170242", ine: "17024", nom: "Bolvir" },
  { idescat: "430304", ine: "43030", nom: "Bonastre" },
  { idescat: "250576", ine: "25057", nom: "Bòrdes, Es" },
  { idescat: "170255", ine: "17025", nom: "Bordils" },
  { idescat: "250582", ine: "25058", nom: "Borges Blanques, les" },
  { idescat: "430311", ine: "43031", nom: "Borges del Camp, les" },
  { idescat: "170268", ine: "17026", nom: "Borrassà" },
  { idescat: "080240", ine: "08024", nom: "Borredà" },
  { idescat: "250595", ine: "25059", nom: "Bossòst" },
  { idescat: "430326", ine: "43032", nom: "Bot" },
  { idescat: "430332", ine: "43033", nom: "Botarell" },
  { idescat: "250560", ine: "25056", nom: "Bovera" },
  { idescat: "430347", ine: "43034", nom: "Bràfim" },
  { idescat: "170274", ine: "17027", nom: "Breda" },
  { idescat: "080253", ine: "08025", nom: "Bruc, el" },
  { idescat: "080266", ine: "08026", nom: "Brull, el" },
  { idescat: "170280", ine: "17028", nom: "Brunyola i Sant Martí Sapresa" },
  { idescat: "430350", ine: "43035", nom: "Cabacés" },
  { idescat: "250609", ine: "25060", nom: "Cabanabona" },
  { idescat: "170314", ine: "17031", nom: "Cabanelles" },
  { idescat: "170307", ine: "17030", nom: "Cabanes" },
  { idescat: "080272", ine: "08027", nom: "Cabanyes, les" },
  { idescat: "250616", ine: "25061", nom: "Cabó" },
  { idescat: "430363", ine: "43036", nom: "Cabra del Camp" },
  { idescat: "080288", ine: "08028", nom: "Cabrera d'Anoia" },
  { idescat: "080291", ine: "08029", nom: "Cabrera de Mar" },
  { idescat: "080305", ine: "08030", nom: "Cabrils" },
  { idescat: "170329", ine: "17032", nom: "Cadaqués" },
  { idescat: "080312", ine: "08031", nom: "Calaf" },
  { idescat: "430379", ine: "43037", nom: "Calafell" },
  { idescat: "080348", ine: "08034", nom: "Calders" },
  { idescat: "080327", ine: "08032", nom: "Caldes d'Estrac" },
  { idescat: "170335", ine: "17033", nom: "Caldes de Malavella" },
  { idescat: "080333", ine: "08033", nom: "Caldes de Montbui" },
  { idescat: "080351", ine: "08035", nom: "Calella" },
  { idescat: "080370", ine: "08037", nom: "Calldetenes" },
  { idescat: "080386", ine: "08038", nom: "Callús" },
  { idescat: "080364", ine: "08036", nom: "Calonge de Segarra" },
  { idescat: "170340", ine: "17034", nom: "Calonge i Sant Antoni" },
  { idescat: "250621", ine: "25062", nom: "Camarasa" },
  { idescat: "439039", ine: "43903", nom: "Camarles" },
  { idescat: "430385", ine: "43038", nom: "Cambrils" },
  { idescat: "170353", ine: "17035", nom: "Camós" },
  { idescat: "170366", ine: "17036", nom: "Campdevànol" },
  { idescat: "170372", ine: "17037", nom: "Campelles" },
  { idescat: "080399", ine: "08039", nom: "Campins" },
  { idescat: "170388", ine: "17038", nom: "Campllong" },
  { idescat: "170391", ine: "17039", nom: "Camprodon" },
  { idescat: "250637", ine: "25063", nom: "Canejan" },
  { idescat: "170405", ine: "17040", nom: "Canet d'Adri" },
  { idescat: "080403", ine: "08040", nom: "Canet de Mar" },
  { idescat: "439076", ine: "43907", nom: "Canonja, la" },
  { idescat: "080410", ine: "08041", nom: "Canovelles" },
  { idescat: "080425", ine: "08042", nom: "Cànoves i Samalús" },
  { idescat: "170412", ine: "17041", nom: "Cantallops" },
  { idescat: "080431", ine: "08043", nom: "Canyelles" },
  { idescat: "430398", ine: "43039", nom: "Capafonts" },
  { idescat: "430402", ine: "43040", nom: "Capçanes" },
  { idescat: "080446", ine: "08044", nom: "Capellades" },
  { idescat: "170427", ine: "17042", nom: "Capmany" },
  { idescat: "080459", ine: "08045", nom: "Capolat" },
  { idescat: "080462", ine: "08046", nom: "Cardedeu" },
  { idescat: "080478", ine: "08047", nom: "Cardona" },
  { idescat: "080484", ine: "08048", nom: "Carme" },
  { idescat: "430419", ine: "43041", nom: "Caseres" },
  { idescat: "170448", ine: "17044", nom: "Cassà de la Selva" },
  { idescat: "080497", ine: "08049", nom: "Casserres" },
  {
    idescat: "170486",
    ine: "17048",
    nom: "Castell d'Aro, Platja d'Aro i s'Agaró"
  },
  { idescat: "080575", ine: "08057", nom: "Castell de l'Areny" },
  { idescat: "259046", ine: "25904", nom: "Castell de Mur" },
  { idescat: "250642", ine: "25064", nom: "Castellar de la Ribera" },
  { idescat: "080522", ine: "08052", nom: "Castellar de n'Hug" },
  { idescat: "080500", ine: "08050", nom: "Castellar del Riu" },
  { idescat: "080517", ine: "08051", nom: "Castellar del Vallès" },
  { idescat: "080538", ine: "08053", nom: "Castellbell i el Vilar" },
  { idescat: "080543", ine: "08054", nom: "Castellbisbal" },
  { idescat: "080556", ine: "08055", nom: "Castellcir" },
  { idescat: "250674", ine: "25067", nom: "Castelldans" },
  { idescat: "080569", ine: "08056", nom: "Castelldefels" },
  { idescat: "080581", ine: "08058", nom: "Castellet i la Gornal" },
  { idescat: "170464", ine: "17046", nom: "Castellfollit de la Roca" },
  { idescat: "080608", ine: "08060", nom: "Castellfollit de Riubregós" },
  { idescat: "080594", ine: "08059", nom: "Castellfollit del Boix" },
  { idescat: "080615", ine: "08061", nom: "Castellgalí" },
  { idescat: "080620", ine: "08062", nom: "Castellnou de Bages" },
  { idescat: "250680", ine: "25068", nom: "Castellnou de Seana" },
  { idescat: "170470", ine: "17047", nom: "Castelló d'Empúries" },
  { idescat: "250693", ine: "25069", nom: "Castelló de Farfanya" },
  { idescat: "080636", ine: "08063", nom: "Castellolí" },
  { idescat: "250707", ine: "25070", nom: "Castellserà" },
  { idescat: "080641", ine: "08064", nom: "Castellterçol" },
  { idescat: "430424", ine: "43042", nom: "Castellvell del Camp" },
  { idescat: "080654", ine: "08065", nom: "Castellví de la Marca" },
  { idescat: "080667", ine: "08066", nom: "Castellví de Rosanes" },
  { idescat: "430430", ine: "43043", nom: "Catllar, el" },
  { idescat: "250714", ine: "25071", nom: "Cava" },
  { idescat: "171899", ine: "17189", nom: "Cellera de Ter, la" },
  { idescat: "170499", ine: "17049", nom: "Celrà" },
  { idescat: "080673", ine: "08067", nom: "Centelles" },
  { idescat: "082687", ine: "08268", nom: "Cercs" },
  { idescat: "082665", ine: "08266", nom: "Cerdanyola del Vallès" },
  { idescat: "080689", ine: "08068", nom: "Cervelló" },
  { idescat: "250729", ine: "25072", nom: "Cervera" },
  { idescat: "250735", ine: "25073", nom: "Cervià de les Garrigues" },
  { idescat: "170502", ine: "17050", nom: "Cervià de Ter" },
  { idescat: "170519", ine: "17051", nom: "Cistella" },
  { idescat: "250740", ine: "25074", nom: "Ciutadilla" },
  { idescat: "250753", ine: "25075", nom: "Clariana de Cardener" },
  { idescat: "250766", ine: "25076", nom: "Cogul, el" },
  { idescat: "170545", ine: "17054", nom: "Colera" },
  { idescat: "250772", ine: "25077", nom: "Coll de Nargó" },
  { idescat: "080692", ine: "08069", nom: "Collbató" },
  { idescat: "430458", ine: "43045", nom: "Colldejou" },
  { idescat: "080706", ine: "08070", nom: "Collsuspina" },
  { idescat: "170558", ine: "17055", nom: "Colomers" },
  { idescat: "251636", ine: "25163", nom: "Coma i la Pedra, la" },
  { idescat: "251615", ine: "25161", nom: "Conca de Dalt" },
  { idescat: "430461", ine: "43046", nom: "Conesa" },
  { idescat: "430477", ine: "43047", nom: "Constantí" },
  { idescat: "080713", ine: "08071", nom: "Copons" },
  { idescat: "430483", ine: "43048", nom: "Corbera d'Ebre" },
  { idescat: "080728", ine: "08072", nom: "Corbera de Llobregat" },
  { idescat: "250788", ine: "25078", nom: "Corbins" },
  { idescat: "170577", ine: "17057", nom: "Corçà" },
  { idescat: "080734", ine: "08073", nom: "Cornellà de Llobregat" },
  { idescat: "170561", ine: "17056", nom: "Cornellà del Terri" },
  { idescat: "430496", ine: "43049", nom: "Cornudella de Montsant" },
  { idescat: "430509", ine: "43050", nom: "Creixell" },
  { idescat: "170583", ine: "17058", nom: "Crespià" },
  {
    idescat: "179011",
    ine: "17901",
    nom: "Cruïlles, Monells i Sant Sadurní de l'Heura"
  },
  { idescat: "080749", ine: "08074", nom: "Cubelles" },
  { idescat: "250791", ine: "25079", nom: "Cubells" },
  { idescat: "430516", ine: "43051", nom: "Cunit" },
  { idescat: "170600", ine: "17060", nom: "Darnius" },
  { idescat: "170617", ine: "17061", nom: "Das" },
  { idescat: "439018", ine: "43901", nom: "Deltebre" },
  { idescat: "080752", ine: "08075", nom: "Dosrius" },
  { idescat: "430537", ine: "43053", nom: "Duesaigües" },
  { idescat: "170622", ine: "17062", nom: "Escala, l'" },
  { idescat: "080765", ine: "08076", nom: "Esparreguera" },
  { idescat: "170638", ine: "17063", nom: "Espinelves" },
  { idescat: "250812", ine: "25081", nom: "Espluga Calba, l'" },
  { idescat: "430542", ine: "43054", nom: "Espluga de Francolí, l'" },
  { idescat: "080771", ine: "08077", nom: "Esplugues de Llobregat" },
  { idescat: "170643", ine: "17064", nom: "Espolla" },
  { idescat: "170656", ine: "17065", nom: "Esponellà" },
  { idescat: "250827", ine: "25082", nom: "Espot" },
  { idescat: "080787", ine: "08078", nom: "Espunyola, l'" },
  { idescat: "082541", ine: "08254", nom: "Esquirol, l'" },
  { idescat: "250886", ine: "25088", nom: "Estamariu" },
  { idescat: "080790", ine: "08079", nom: "Estany, l'" },
  { idescat: "250851", ine: "25085", nom: "Estaràs" },
  { idescat: "250864", ine: "25086", nom: "Esterri d'Àneu" },
  { idescat: "250870", ine: "25087", nom: "Esterri de Cardós" },
  { idescat: "430555", ine: "43055", nom: "Falset" },
  { idescat: "170059", ine: "17005", nom: "Far d'Empordà, el" },
  { idescat: "250899", ine: "25089", nom: "Farrera" },
  { idescat: "430568", ine: "43056", nom: "Fatarella, la" },
  { idescat: "430574", ine: "43057", nom: "Febró, la" },
  { idescat: "081347", ine: "08134", nom: "Figaró-Montmany" },
  { idescat: "080804", ine: "08080", nom: "Fígols" },
  { idescat: "259084", ine: "25908", nom: "Fígols i Alinyà" },
  { idescat: "430580", ine: "43058", nom: "Figuera, la" },
  { idescat: "170669", ine: "17066", nom: "Figueres" },
  { idescat: "430593", ine: "43059", nom: "Figuerola del Camp" },
  { idescat: "170675", ine: "17067", nom: "Flaçà" },
  { idescat: "430607", ine: "43060", nom: "Flix" },
  { idescat: "250925", ine: "25092", nom: "Floresta, la" },
  { idescat: "080826", ine: "08082", nom: "Fogars de la Selva" },
  { idescat: "080811", ine: "08081", nom: "Fogars de Montclús" },
  { idescat: "170681", ine: "17068", nom: "Foixà" },
  { idescat: "080832", ine: "08083", nom: "Folgueroles" },
  { idescat: "250931", ine: "25093", nom: "Fondarella" },
  { idescat: "080847", ine: "08084", nom: "Fonollosa" },
  { idescat: "080850", ine: "08085", nom: "Font-rubí" },
  { idescat: "170694", ine: "17069", nom: "Fontanals de Cerdanya" },
  { idescat: "170708", ine: "17070", nom: "Fontanilles" },
  { idescat: "170715", ine: "17071", nom: "Fontcoberta" },
  { idescat: "250946", ine: "25094", nom: "Foradada" },
  { idescat: "179026", ine: "17902", nom: "Forallac" },
  { idescat: "430614", ine: "43061", nom: "Forès" },
  { idescat: "170736", ine: "17073", nom: "Fornells de la Selva" },
  { idescat: "170741", ine: "17074", nom: "Fortià" },
  { idescat: "080863", ine: "08086", nom: "Franqueses del Vallès, les" },
  { idescat: "430629", ine: "43062", nom: "Freginals" },
  { idescat: "250962", ine: "25096", nom: "Fuliola, la" },
  { idescat: "250978", ine: "25097", nom: "Fulleda" },
  { idescat: "080902", ine: "08090", nom: "Gaià" },
  { idescat: "430635", ine: "43063", nom: "Galera, la" },
  { idescat: "080879", ine: "08087", nom: "Gallifa" },
  { idescat: "430640", ine: "43064", nom: "Gandesa" },
  { idescat: "430653", ine: "43065", nom: "Garcia" },
  { idescat: "430666", ine: "43066", nom: "Garidells, els" },
  { idescat: "080885", ine: "08088", nom: "Garriga, la" },
  { idescat: "170754", ine: "17075", nom: "Garrigàs" },
  { idescat: "170767", ine: "17076", nom: "Garrigoles" },
  { idescat: "170773", ine: "17077", nom: "Garriguella" },
  { idescat: "080898", ine: "08089", nom: "Gavà" },
  { idescat: "250984", ine: "25098", nom: "Gavet de la Conca" },
  { idescat: "080919", ine: "08091", nom: "Gelida" },
  { idescat: "170789", ine: "17078", nom: "Ger" },
  { idescat: "259123", ine: "25912", nom: "Gimenells i el Pla de la Font" },
  { idescat: "430672", ine: "43067", nom: "Ginestar" },
  { idescat: "170792", ine: "17079", nom: "Girona" },
  { idescat: "080924", ine: "08092", nom: "Gironella" },
  { idescat: "080930", ine: "08093", nom: "Gisclareny" },
  { idescat: "430688", ine: "43068", nom: "Godall" },
  { idescat: "250997", ine: "25099", nom: "Golmés" },
  { idescat: "170806", ine: "17080", nom: "Gombrèn" },
  { idescat: "251001", ine: "25100", nom: "Gósol" },
  { idescat: "080945", ine: "08094", nom: "Granada, la" },
  { idescat: "251018", ine: "25101", nom: "Granadella, la" },
  { idescat: "080958", ine: "08095", nom: "Granera" },
  { idescat: "251023", ine: "25102", nom: "Granja d'Escarp, la" },
  { idescat: "080961", ine: "08096", nom: "Granollers" },
  { idescat: "251039", ine: "25103", nom: "Granyanella" },
  { idescat: "251057", ine: "25105", nom: "Granyena de les Garrigues" },
  { idescat: "251044", ine: "25104", nom: "Granyena de Segarra" },
  { idescat: "430691", ine: "43069", nom: "Gratallops" },
  { idescat: "080977", ine: "08097", nom: "Gualba" },
  { idescat: "170813", ine: "17081", nom: "Gualta" },
  { idescat: "080996", ine: "08099", nom: "Guardiola de Berguedà" },
  { idescat: "430705", ine: "43070", nom: "Guiamets, els" },
  { idescat: "170828", ine: "17082", nom: "Guils de Cerdanya" },
  { idescat: "251095", ine: "25109", nom: "Guimerà" },
  { idescat: "259031", ine: "25903", nom: "Guingueta d'Àneu, la" },
  { idescat: "251109", ine: "25110", nom: "Guissona" },
  { idescat: "251116", ine: "25111", nom: "Guixers" },
  { idescat: "081000", ine: "08100", nom: "Gurb" },
  { idescat: "430712", ine: "43071", nom: "Horta de Sant Joan" },
  { idescat: "081017", ine: "08101", nom: "Hospitalet de Llobregat, l'" },
  { idescat: "081629", ine: "08162", nom: "Hostalets de Pierola, els" },
  { idescat: "170834", ine: "17083", nom: "Hostalric" },
  { idescat: "081022", ine: "08102", nom: "Igualada" },
  { idescat: "251155", ine: "25115", nom: "Isona i Conca Dellà" },
  { idescat: "170849", ine: "17084", nom: "Isòvol" },
  { idescat: "251137", ine: "25113", nom: "Ivars d'Urgell" },
  { idescat: "251121", ine: "25112", nom: "Ivars de Noguera" },
  { idescat: "251142", ine: "25114", nom: "Ivorra" },
  { idescat: "170852", ine: "17085", nom: "Jafre" },
  { idescat: "170865", ine: "17086", nom: "Jonquera, la" },
  { idescat: "081038", ine: "08103", nom: "Jorba" },
  { idescat: "259101", ine: "25910", nom: "Josa i Tuixén" },
  { idescat: "170871", ine: "17087", nom: "Juià" },
  { idescat: "251180", ine: "25118", nom: "Juncosa" },
  { idescat: "251193", ine: "25119", nom: "Juneda" },
  { idescat: "251214", ine: "25121", nom: "Les" },
  { idescat: "251229", ine: "25122", nom: "Linyola" },
  { idescat: "081043", ine: "08104", nom: "Llacuna, la" },
  { idescat: "170887", ine: "17088", nom: "Lladó" },
  { idescat: "251235", ine: "25123", nom: "Lladorre" },
  { idescat: "251240", ine: "25124", nom: "Lladurs" },
  { idescat: "081056", ine: "08105", nom: "Llagosta, la" },
  { idescat: "170890", ine: "17089", nom: "Llagostera" },
  { idescat: "170904", ine: "17090", nom: "Llambilles" },
  { idescat: "170911", ine: "17091", nom: "Llanars" },
  { idescat: "170926", ine: "17092", nom: "Llançà" },
  { idescat: "251253", ine: "25125", nom: "Llardecans" },
  { idescat: "251266", ine: "25126", nom: "Llavorsí" },
  { idescat: "251207", ine: "25120", nom: "Lleida" },
  { idescat: "170932", ine: "17093", nom: "Llers" },
  { idescat: "251272", ine: "25127", nom: "Lles de Cerdanya" },
  { idescat: "081075", ine: "08107", nom: "Lliçà d'Amunt" },
  { idescat: "081081", ine: "08108", nom: "Lliçà de Vall" },
  { idescat: "251288", ine: "25128", nom: "Llimiana" },
  { idescat: "081069", ine: "08106", nom: "Llinars del Vallès" },
  { idescat: "170947", ine: "17094", nom: "Llívia" },
  { idescat: "430727", ine: "43072", nom: "Lloar, el" },
  { idescat: "251291", ine: "25129", nom: "Llobera" },
  { idescat: "430733", ine: "43073", nom: "Llorac" },
  { idescat: "430748", ine: "43074", nom: "Llorenç del Penedès" },
  { idescat: "170950", ine: "17095", nom: "Lloret de Mar" },
  { idescat: "170963", ine: "17096", nom: "Llosses, les" },
  { idescat: "081094", ine: "08109", nom: "Lluçà" },
  { idescat: "171024", ine: "17102", nom: "Maçanet de Cabrenys" },
  { idescat: "171030", ine: "17103", nom: "Maçanet de la Selva" },
  { idescat: "170979", ine: "17097", nom: "Madremanya" },
  { idescat: "170985", ine: "17098", nom: "Maià de Montcal" },
  { idescat: "251333", ine: "25133", nom: "Maials" },
  { idescat: "251305", ine: "25130", nom: "Maldà" },
  { idescat: "081108", ine: "08110", nom: "Malgrat de Mar" },
  { idescat: "081115", ine: "08111", nom: "Malla" },
  { idescat: "081120", ine: "08112", nom: "Manlleu" },
  { idescat: "081136", ine: "08113", nom: "Manresa" },
  { idescat: "430764", ine: "43076", nom: "Marçà" },
  { idescat: "430751", ine: "43075", nom: "Margalef" },
  { idescat: "082423", ine: "08242", nom: "Marganell" },
  { idescat: "081141", ine: "08114", nom: "Martorell" },
  { idescat: "081154", ine: "08115", nom: "Martorelles" },
  { idescat: "430770", ine: "43077", nom: "Mas de Barberans" },
  { idescat: "171002", ine: "17100", nom: "Masarac i Vilarnadal" },
  { idescat: "430786", ine: "43078", nom: "Masdenverge" },
  { idescat: "081167", ine: "08116", nom: "Masies de Roda, les" },
  { idescat: "081173", ine: "08117", nom: "Masies de Voltregà, les" },
  { idescat: "430799", ine: "43079", nom: "Masllorenç" },
  { idescat: "081189", ine: "08118", nom: "Masnou, el" },
  { idescat: "430803", ine: "43080", nom: "Masó, la" },
  { idescat: "430810", ine: "43081", nom: "Maspujols" },
  { idescat: "081192", ine: "08119", nom: "Masquefa" },
  { idescat: "430825", ine: "43082", nom: "Masroig, el" },
  { idescat: "251312", ine: "25131", nom: "Massalcoreig" },
  { idescat: "171019", ine: "17101", nom: "Massanes" },
  { idescat: "251327", ine: "25132", nom: "Massoteres" },
  { idescat: "081206", ine: "08120", nom: "Matadepera" },
  { idescat: "081213", ine: "08121", nom: "Mataró" },
  { idescat: "081228", ine: "08122", nom: "Mediona" },
  { idescat: "251348", ine: "25134", nom: "Menàrguens" },
  { idescat: "170998", ine: "17099", nom: "Meranges" },
  { idescat: "171058", ine: "17105", nom: "Mieres" },
  { idescat: "430831", ine: "43083", nom: "Milà, el" },
  { idescat: "251351", ine: "25135", nom: "Miralcamp" },
  { idescat: "430846", ine: "43084", nom: "Miravet" },
  { idescat: "081385", ine: "08138", nom: "Moià" },
  { idescat: "430859", ine: "43085", nom: "Molar, el" },
  { idescat: "081234", ine: "08123", nom: "Molins de Rei" },
  { idescat: "251370", ine: "25137", nom: "Mollerussa" },
  { idescat: "171061", ine: "17106", nom: "Mollet de Peralada" },
  { idescat: "081249", ine: "08124", nom: "Mollet del Vallès" },
  { idescat: "171077", ine: "17107", nom: "Molló" },
  { idescat: "251364", ine: "25136", nom: "Molsosa, la" },
  { idescat: "081287", ine: "08128", nom: "Monistrol de Calders" },
  { idescat: "081271", ine: "08127", nom: "Monistrol de Montserrat" },
  { idescat: "430918", ine: "43091", nom: "Mont-ral" },
  { idescat: "171100", ine: "17110", nom: "Mont-ras" },
  { idescat: "430923", ine: "43092", nom: "Mont-roig del Camp" },
  { idescat: "171096", ine: "17109", nom: "Montagut i Oix" },
  { idescat: "430862", ine: "43086", nom: "Montblanc" },
  { idescat: "430884", ine: "43088", nom: "Montbrió del Camp" },
  { idescat: "081252", ine: "08125", nom: "Montcada i Reixac" },
  { idescat: "081304", ine: "08130", nom: "Montclar" },
  { idescat: "251399", ine: "25139", nom: "Montellà i Martinet" },
  { idescat: "081311", ine: "08131", nom: "Montesquiu" },
  { idescat: "251403", ine: "25140", nom: "Montferrer i Castellbò" },
  { idescat: "430897", ine: "43089", nom: "Montferri" },
  { idescat: "251386", ine: "25138", nom: "Montgai" },
  { idescat: "081265", ine: "08126", nom: "Montgat" },
  { idescat: "081326", ine: "08132", nom: "Montmajor" },
  { idescat: "081332", ine: "08133", nom: "Montmaneu" },
  { idescat: "430901", ine: "43090", nom: "Montmell, el" },
  { idescat: "081350", ine: "08135", nom: "Montmeló" },
  { idescat: "251425", ine: "25142", nom: "Montoliu de Lleida" },
  { idescat: "251410", ine: "25141", nom: "Montoliu de Segarra" },
  { idescat: "251431", ine: "25143", nom: "Montornès de Segarra" },
  { idescat: "081363", ine: "08136", nom: "Montornès del Vallès" },
  { idescat: "081379", ine: "08137", nom: "Montseny" },
  { idescat: "430939", ine: "43093", nom: "Móra d'Ebre" },
  { idescat: "430944", ine: "43094", nom: "Móra la Nova" },
  { idescat: "430957", ine: "43095", nom: "Morell, el" },
  { idescat: "430960", ine: "43096", nom: "Morera de Montsant, la" },
  { idescat: "081290", ine: "08129", nom: "Muntanyola" },
  { idescat: "081398", ine: "08139", nom: "Mura" },
  { idescat: "251459", ine: "25145", nom: "Nalec" },
  { idescat: "250254", ine: "25025", nom: "Naut Aran" },
  { idescat: "081402", ine: "08140", nom: "Navarcles" },
  { idescat: "081419", ine: "08141", nom: "Navàs" },
  { idescat: "171117", ine: "17111", nom: "Navata" },
  { idescat: "251462", ine: "25146", nom: "Navès" },
  { idescat: "081424", ine: "08142", nom: "Nou de Berguedà, la" },
  { idescat: "430976", ine: "43097", nom: "Nou de Gaià, la" },
  { idescat: "430982", ine: "43098", nom: "Nulles" },
  { idescat: "251484", ine: "25148", nom: "Odèn" },
  { idescat: "081430", ine: "08143", nom: "Òdena" },
  { idescat: "171122", ine: "17112", nom: "Ogassa" },
  { idescat: "081458", ine: "08145", nom: "Olèrdola" },
  { idescat: "081461", ine: "08146", nom: "Olesa de Bonesvalls" },
  { idescat: "081477", ine: "08147", nom: "Olesa de Montserrat" },
  { idescat: "251497", ine: "25149", nom: "Oliana" },
  { idescat: "251500", ine: "25150", nom: "Oliola" },
  { idescat: "251517", ine: "25151", nom: "Olius" },
  { idescat: "081483", ine: "08148", nom: "Olivella" },
  { idescat: "081496", ine: "08149", nom: "Olost" },
  { idescat: "171143", ine: "17114", nom: "Olot" },
  { idescat: "251522", ine: "25152", nom: "Oluges, les" },
  { idescat: "081445", ine: "08144", nom: "Olvan" },
  { idescat: "251538", ine: "25153", nom: "Omellons, els" },
  { idescat: "251543", ine: "25154", nom: "Omells de na Gaia, els" },
  { idescat: "171156", ine: "17115", nom: "Ordis" },
  { idescat: "251556", ine: "25155", nom: "Organyà" },
  { idescat: "081509", ine: "08150", nom: "Orís" },
  { idescat: "081516", ine: "08151", nom: "Oristà" },
  { idescat: "081521", ine: "08152", nom: "Orpí" },
  { idescat: "081537", ine: "08153", nom: "Òrrius" },
  { idescat: "251569", ine: "25156", nom: "Os de Balaguer" },
  { idescat: "171169", ine: "17116", nom: "Osor" },
  { idescat: "251575", ine: "25157", nom: "Ossó de Sió" },
  { idescat: "081542", ine: "08154", nom: "Pacs del Penedès" },
  { idescat: "081555", ine: "08155", nom: "Palafolls" },
  { idescat: "171175", ine: "17117", nom: "Palafrugell" },
  { idescat: "171181", ine: "17118", nom: "Palamós" },
  { idescat: "251581", ine: "25158", nom: "Palau d'Anglesola, el" },
  { idescat: "171194", ine: "17119", nom: "Palau de Santa Eulàlia" },
  { idescat: "171215", ine: "17121", nom: "Palau-sator" },
  { idescat: "171208", ine: "17120", nom: "Palau-saverdera" },
  { idescat: "081568", ine: "08156", nom: "Palau-solità i Plegamans" },
  { idescat: "431009", ine: "43100", nom: "Pallaresos, els" },
  { idescat: "081574", ine: "08157", nom: "Pallejà" },
  { idescat: "430995", ine: "43099", nom: "Palma d'Ebre, la" },
  { idescat: "089058", ine: "08905", nom: "Palma de Cervelló, la" },
  { idescat: "171236", ine: "17123", nom: "Palol de Revardit" },
  { idescat: "171241", ine: "17124", nom: "Pals" },
  { idescat: "081580", ine: "08158", nom: "Papiol, el" },
  { idescat: "171254", ine: "17125", nom: "Pardines" },
  { idescat: "081593", ine: "08159", nom: "Parets del Vallès" },
  { idescat: "171267", ine: "17126", nom: "Parlavà" },
  { idescat: "431016", ine: "43101", nom: "Passanant i Belltall" },
  { idescat: "171289", ine: "17128", nom: "Pau" },
  { idescat: "431021", ine: "43102", nom: "Paüls" },
  { idescat: "171292", ine: "17129", nom: "Pedret i Marzà" },
  { idescat: "251641", ine: "25164", nom: "Penelles" },
  { idescat: "171306", ine: "17130", nom: "Pera, la" },
  { idescat: "081607", ine: "08160", nom: "Perafita" },
  { idescat: "431037", ine: "43103", nom: "Perafort" },
  { idescat: "171328", ine: "17132", nom: "Peralada" },
  { idescat: "251654", ine: "25165", nom: "Peramola" },
  { idescat: "431042", ine: "43104", nom: "Perelló, el" },
  { idescat: "081614", ine: "08161", nom: "Piera" },
  { idescat: "431055", ine: "43105", nom: "Piles, les" },
  { idescat: "081635", ine: "08163", nom: "Pineda de Mar" },
  { idescat: "431068", ine: "43106", nom: "Pinell de Brai, el" },
  { idescat: "251667", ine: "25166", nom: "Pinell de Solsonès" },
  { idescat: "251673", ine: "25167", nom: "Pinós" },
  { idescat: "431074", ine: "43107", nom: "Pira" },
  { idescat: "431080", ine: "43108", nom: "Pla de Santa Maria, el" },
  { idescat: "081640", ine: "08164", nom: "Pla del Penedès, el" },
  { idescat: "171334", ine: "17133", nom: "Planes d'Hostoles, les" },
  { idescat: "171349", ine: "17134", nom: "Planoles" },
  { idescat: "259118", ine: "25911", nom: "Plans de Sió, els" },
  { idescat: "251689", ine: "25168", nom: "Poal, el" },
  { idescat: "251692", ine: "25169", nom: "Pobla de Cérvoles, la" },
  { idescat: "081653", ine: "08165", nom: "Pobla de Claramunt, la" },
  { idescat: "081666", ine: "08166", nom: "Pobla de Lillet, la" },
  { idescat: "431093", ine: "43109", nom: "Pobla de Mafumet, la" },
  { idescat: "431107", ine: "43110", nom: "Pobla de Massaluca, la" },
  { idescat: "431114", ine: "43111", nom: "Pobla de Montornès, la" },
  { idescat: "251713", ine: "25171", nom: "Pobla de Segur, la" },
  { idescat: "431129", ine: "43112", nom: "Poboleda" },
  { idescat: "081672", ine: "08167", nom: "Polinyà" },
  { idescat: "431135", ine: "43113", nom: "Pont d'Armentera, el" },
  { idescat: "250306", ine: "25030", nom: "Pont de Bar, el" },
  { idescat: "171352", ine: "17135", nom: "Pont de Molins" },
  { idescat: "251734", ine: "25173", nom: "Pont de Suert, el" },
  { idescat: "081825", ine: "08182", nom: "Pont de Vilomara i Rocafort, el" },
  { idescat: "431418", ine: "43141", nom: "Pontils" },
  { idescat: "081688", ine: "08168", nom: "Pontons" },
  { idescat: "171365", ine: "17136", nom: "Pontós" },
  { idescat: "251728", ine: "25172", nom: "Ponts" },
  { idescat: "171371", ine: "17137", nom: "Porqueres" },
  { idescat: "431140", ine: "43114", nom: "Porrera" },
  { idescat: "171404", ine: "17140", nom: "Port de la Selva, el" },
  { idescat: "171387", ine: "17138", nom: "Portbou" },
  { idescat: "251749", ine: "25174", nom: "Portella, la" },
  { idescat: "431153", ine: "43115", nom: "Pradell de la Teixeta" },
  { idescat: "431166", ine: "43116", nom: "Prades" },
  { idescat: "431172", ine: "43117", nom: "Prat de Comte" },
  { idescat: "081691", ine: "08169", nom: "Prat de Llobregat, el" },
  { idescat: "431188", ine: "43118", nom: "Pratdip" },
  { idescat: "081712", ine: "08171", nom: "Prats de Lluçanès" },
  { idescat: "081705", ine: "08170", nom: "Prats de Rei, els" },
  { idescat: "251752", ine: "25175", nom: "Prats i Sansor" },
  { idescat: "251765", ine: "25176", nom: "Preixana" },
  { idescat: "251771", ine: "25177", nom: "Preixens" },
  { idescat: "082303", ine: "08230", nom: "Premià de Dalt" },
  { idescat: "081727", ine: "08172", nom: "Premià de Mar" },
  { idescat: "171390", ine: "17139", nom: "Preses, les" },
  { idescat: "251790", ine: "25179", nom: "Prullans" },
  { idescat: "081751", ine: "08175", nom: "Puig-reig" },
  { idescat: "171411", ine: "17141", nom: "Puigcerdà" },
  { idescat: "081748", ine: "08174", nom: "Puigdàlber" },
  { idescat: "251804", ine: "25180", nom: "Puiggròs" },
  { idescat: "431191", ine: "43119", nom: "Puigpelat" },
  { idescat: "251811", ine: "25181", nom: "Puigverd d'Agramunt" },
  { idescat: "251826", ine: "25182", nom: "Puigverd de Lleida" },
  { idescat: "081764", ine: "08176", nom: "Pujalt" },
  { idescat: "081770", ine: "08177", nom: "Quar, la" },
  { idescat: "171426", ine: "17142", nom: "Quart" },
  { idescat: "170433", ine: "17043", nom: "Queralbs" },
  { idescat: "431205", ine: "43120", nom: "Querol" },
  { idescat: "171432", ine: "17143", nom: "Rabós" },
  { idescat: "081786", ine: "08178", nom: "Rajadell" },
  { idescat: "431362", ine: "43136", nom: "Ràpita, la" },
  { idescat: "431212", ine: "43121", nom: "Rasquera" },
  { idescat: "171447", ine: "17144", nom: "Regencós" },
  { idescat: "081799", ine: "08179", nom: "Rellinars" },
  { idescat: "431227", ine: "43122", nom: "Renau" },
  { idescat: "431233", ine: "43123", nom: "Reus" },
  { idescat: "251832", ine: "25183", nom: "Rialp" },
  { idescat: "431248", ine: "43124", nom: "Riba, la" },
  { idescat: "431251", ine: "43125", nom: "Riba-roja d'Ebre" },
  { idescat: "259059", ine: "25905", nom: "Ribera d'Ondara" },
  { idescat: "251850", ine: "25185", nom: "Ribera d'Urgellet" },
  { idescat: "171450", ine: "17145", nom: "Ribes de Freser" },
  { idescat: "171463", ine: "17146", nom: "Riells i Viabrea" },
  { idescat: "431264", ine: "43126", nom: "Riera de Gaià, la" },
  { idescat: "251863", ine: "25186", nom: "Riner" },
  { idescat: "171479", ine: "17147", nom: "Ripoll" },
  { idescat: "081803", ine: "08180", nom: "Ripollet" },
  { idescat: "259139", ine: "25913", nom: "Riu de Cerdanya" },
  { idescat: "171485", ine: "17148", nom: "Riudarenes" },
  { idescat: "171498", ine: "17149", nom: "Riudaura" },
  { idescat: "431270", ine: "43127", nom: "Riudecanyes" },
  { idescat: "431286", ine: "43128", nom: "Riudecols" },
  { idescat: "171501", ine: "17150", nom: "Riudellots de la Selva" },
  { idescat: "431299", ine: "43129", nom: "Riudoms" },
  { idescat: "171518", ine: "17151", nom: "Riumors" },
  { idescat: "081810", ine: "08181", nom: "Roca del Vallès, la" },
  { idescat: "431303", ine: "43130", nom: "Rocafort de Queralt" },
  { idescat: "431310", ine: "43131", nom: "Roda de Berà" },
  { idescat: "081831", ine: "08183", nom: "Roda de Ter" },
  { idescat: "431325", ine: "43132", nom: "Rodonyà" },
  { idescat: "431331", ine: "43133", nom: "Roquetes" },
  { idescat: "171523", ine: "17152", nom: "Roses" },
  { idescat: "251898", ine: "25189", nom: "Rosselló" },
  { idescat: "431346", ine: "43134", nom: "Rourell, el" },
  { idescat: "081846", ine: "08184", nom: "Rubí" },
  { idescat: "081859", ine: "08185", nom: "Rubió" },
  { idescat: "171539", ine: "17153", nom: "Rupià" },
  { idescat: "089019", ine: "08901", nom: "Rupit i Pruit" },
  { idescat: "081878", ine: "08187", nom: "Sabadell" },
  { idescat: "081884", ine: "08188", nom: "Sagàs" },
  { idescat: "251902", ine: "25190", nom: "Salàs de Pallars" },
  { idescat: "081901", ine: "08190", nom: "Saldes" },
  { idescat: "171544", ine: "17154", nom: "Sales de Llierca" },
  { idescat: "081918", ine: "08191", nom: "Sallent" },
  { idescat: "431359", ine: "43135", nom: "Salomó" },
  { idescat: "439057", ine: "43905", nom: "Salou" },
  { idescat: "171557", ine: "17155", nom: "Salt" },
  { idescat: "251919", ine: "25191", nom: "Sanaüja" },
  { idescat: "081944", ine: "08194", nom: "Sant Adrià de Besòs" },
  { idescat: "081957", ine: "08195", nom: "Sant Agustí de Lluçanès" },
  { idescat: "081960", ine: "08196", nom: "Sant Andreu de la Barca" },
  { idescat: "081976", ine: "08197", nom: "Sant Andreu de Llavaneres" },
  { idescat: "171576", ine: "17157", nom: "Sant Andreu Salou" },
  { idescat: "171833", ine: "17183", nom: "Sant Aniol de Finestres" },
  { idescat: "081982", ine: "08198", nom: "Sant Antoni de Vilamajor" },
  { idescat: "081995", ine: "08199", nom: "Sant Bartomeu del Grau" },
  { idescat: "082009", ine: "08200", nom: "Sant Boi de Llobregat" },
  { idescat: "082016", ine: "08201", nom: "Sant Boi de Lluçanès" },
  { idescat: "082037", ine: "08203", nom: "Sant Cebrià de Vallalta" },
  { idescat: "082021", ine: "08202", nom: "Sant Celoni" },
  { idescat: "082042", ine: "08204", nom: "Sant Climent de Llobregat" },
  { idescat: "171582", ine: "17158", nom: "Sant Climent Sescebes" },
  { idescat: "082055", ine: "08205", nom: "Sant Cugat del Vallès" },
  { idescat: "082068", ine: "08206", nom: "Sant Cugat Sesgarrigues" },
  { idescat: "251961", ine: "25196", nom: "Sant Esteve de la Sarga" },
  { idescat: "082074", ine: "08207", nom: "Sant Esteve de Palautordera" },
  { idescat: "082080", ine: "08208", nom: "Sant Esteve Sesrovires" },
  { idescat: "171595", ine: "17159", nom: "Sant Feliu de Buixalleu" },
  { idescat: "082107", ine: "08210", nom: "Sant Feliu de Codines" },
  { idescat: "171609", ine: "17160", nom: "Sant Feliu de Guíxols" },
  { idescat: "082114", ine: "08211", nom: "Sant Feliu de Llobregat" },
  { idescat: "171616", ine: "17161", nom: "Sant Feliu de Pallerols" },
  { idescat: "082129", ine: "08212", nom: "Sant Feliu Sasserra" },
  { idescat: "171621", ine: "17162", nom: "Sant Ferriol" },
  { idescat: "082093", ine: "08209", nom: "Sant Fost de Campsentelles" },
  { idescat: "082135", ine: "08213", nom: "Sant Fruitós de Bages" },
  { idescat: "171637", ine: "17163", nom: "Sant Gregori" },
  { idescat: "251924", ine: "25192", nom: "Sant Guim de Freixenet" },
  { idescat: "251977", ine: "25197", nom: "Sant Guim de la Plana" },
  { idescat: "171642", ine: "17164", nom: "Sant Hilari Sacalm" },
  { idescat: "082153", ine: "08215", nom: "Sant Hipòlit de Voltregà" },
  { idescat: "081939", ine: "08193", nom: "Sant Iscle de Vallalta" },
  { idescat: "439023", ine: "43902", nom: "Sant Jaume d'Enveja" },
  { idescat: "082166", ine: "08216", nom: "Sant Jaume de Frontanyà" },
  { idescat: "171655", ine: "17165", nom: "Sant Jaume de Llierca" },
  { idescat: "431378", ine: "43137", nom: "Sant Jaume dels Domenys" },
  { idescat: "171674", ine: "17167", nom: "Sant Joan de les Abadesses" },
  { idescat: "171680", ine: "17168", nom: "Sant Joan de Mollet" },
  { idescat: "082188", ine: "08218", nom: "Sant Joan de Vilatorrada" },
  { idescat: "082172", ine: "08217", nom: "Sant Joan Despí" },
  { idescat: "171851", ine: "17185", nom: "Sant Joan les Fonts" },
  { idescat: "171668", ine: "17166", nom: "Sant Jordi Desvalls" },
  { idescat: "089030", ine: "08903", nom: "Sant Julià de Cerdanyola" },
  { idescat: "171693", ine: "17169", nom: "Sant Julià de Ramis" },
  { idescat: "082205", ine: "08220", nom: "Sant Julià de Vilatorta" },
  { idescat: "179032", ine: "17903", nom: "Sant Julià del Llor i Bonmatí" },
  { idescat: "082212", ine: "08221", nom: "Sant Just Desvern" },
  { idescat: "082227", ine: "08222", nom: "Sant Llorenç d'Hortons" },
  { idescat: "171714", ine: "17171", nom: "Sant Llorenç de la Muga" },
  { idescat: "251930", ine: "25193", nom: "Sant Llorenç de Morunys" },
  { idescat: "082233", ine: "08223", nom: "Sant Llorenç Savall" },
  { idescat: "082251", ine: "08225", nom: "Sant Martí d'Albars" },
  { idescat: "082248", ine: "08224", nom: "Sant Martí de Centelles" },
  { idescat: "171729", ine: "17172", nom: "Sant Martí de Llémena" },
  { idescat: "259025", ine: "25902", nom: "Sant Martí de Riucorb" },
  { idescat: "082264", ine: "08226", nom: "Sant Martí de Tous" },
  { idescat: "082270", ine: "08227", nom: "Sant Martí Sarroca" },
  { idescat: "082286", ine: "08228", nom: "Sant Martí Sesgueioles" },
  { idescat: "171735", ine: "17173", nom: "Sant Martí Vell" },
  { idescat: "082299", ine: "08229", nom: "Sant Mateu de Bages" },
  { idescat: "171740", ine: "17174", nom: "Sant Miquel de Campmajor" },
  { idescat: "171753", ine: "17175", nom: "Sant Miquel de Fluvià" },
  { idescat: "171766", ine: "17176", nom: "Sant Mori" },
  { idescat: "171772", ine: "17177", nom: "Sant Pau de Segúries" },
  { idescat: "082310", ine: "08231", nom: "Sant Pere de Ribes" },
  { idescat: "082325", ine: "08232", nom: "Sant Pere de Riudebitlles" },
  { idescat: "082331", ine: "08233", nom: "Sant Pere de Torelló" },
  { idescat: "082346", ine: "08234", nom: "Sant Pere de Vilamajor" },
  { idescat: "171788", ine: "17178", nom: "Sant Pere Pescador" },
  { idescat: "081897", ine: "08189", nom: "Sant Pere Sallavinera" },
  { idescat: "082359", ine: "08235", nom: "Sant Pol de Mar" },
  { idescat: "082362", ine: "08236", nom: "Sant Quintí de Mediona" },
  { idescat: "082378", ine: "08237", nom: "Sant Quirze de Besora" },
  { idescat: "082384", ine: "08238", nom: "Sant Quirze del Vallès" },
  { idescat: "082397", ine: "08239", nom: "Sant Quirze Safaja" },
  { idescat: "251945", ine: "25194", nom: "Sant Ramon" },
  { idescat: "082401", ine: "08240", nom: "Sant Sadurní d'Anoia" },
  { idescat: "082418", ine: "08241", nom: "Sant Sadurní d'Osormort" },
  { idescat: "080983", ine: "08098", nom: "Sant Salvador de Guardiola" },
  { idescat: "082628", ine: "08262", nom: "Sant Vicenç de Castellet" },
  { idescat: "082649", ine: "08264", nom: "Sant Vicenç de Montalt" },
  { idescat: "082652", ine: "08265", nom: "Sant Vicenç de Torelló" },
  { idescat: "082634", ine: "08263", nom: "Sant Vicenç dels Horts" },
  { idescat: "431384", ine: "43138", nom: "Santa Bàrbara" },
  { idescat: "082439", ine: "08243", nom: "Santa Cecília de Voltregà" },
  { idescat: "082444", ine: "08244", nom: "Santa Coloma de Cervelló" },
  { idescat: "171805", ine: "17180", nom: "Santa Coloma de Farners" },
  { idescat: "082457", ine: "08245", nom: "Santa Coloma de Gramenet" },
  { idescat: "431397", ine: "43139", nom: "Santa Coloma de Queralt" },
  { idescat: "171812", ine: "17181", nom: "Santa Cristina d'Aro" },
  { idescat: "082460", ine: "08246", nom: "Santa Eugènia de Berga" },
  { idescat: "082476", ine: "08247", nom: "Santa Eulàlia de Riuprimer" },
  { idescat: "082482", ine: "08248", nom: "Santa Eulàlia de Ronçana" },
  { idescat: "082495", ine: "08249", nom: "Santa Fe del Penedès" },
  { idescat: "171827", ine: "17182", nom: "Santa Llogaia d'Àlguema" },
  { idescat: "082508", ine: "08250", nom: "Santa Margarida de Montbui" },
  { idescat: "082515", ine: "08251", nom: "Santa Margarida i els Monjos" },
  { idescat: "082589", ine: "08258", nom: "Santa Maria d'Oló" },
  { idescat: "082536", ine: "08253", nom: "Santa Maria de Besora" },
  { idescat: "082567", ine: "08256", nom: "Santa Maria de Martorelles" },
  { idescat: "082554", ine: "08255", nom: "Santa Maria de Merlès" },
  { idescat: "082573", ine: "08257", nom: "Santa Maria de Miralles" },
  { idescat: "082592", ine: "08259", nom: "Santa Maria de Palautordera" },
  { idescat: "431401", ine: "43140", nom: "Santa Oliva" },
  { idescat: "171848", ine: "17184", nom: "Santa Pau" },
  { idescat: "082606", ine: "08260", nom: "Santa Perpètua de Mogoda" },
  { idescat: "082613", ine: "08261", nom: "Santa Susanna" },
  { idescat: "081923", ine: "08192", nom: "Santpedor" },
  { idescat: "431423", ine: "43142", nom: "Sarral" },
  { idescat: "171864", ine: "17186", nom: "Sarrià de Ter" },
  { idescat: "252017", ine: "25201", nom: "Sarroca de Bellera" },
  { idescat: "252000", ine: "25200", nom: "Sarroca de Lleida" },
  { idescat: "171870", ine: "17187", nom: "Saus, Camallera i Llampaies" },
  { idescat: "431439", ine: "43143", nom: "Savallà del Comtat" },
  { idescat: "431444", ine: "43144", nom: "Secuita, la" },
  { idescat: "171886", ine: "17188", nom: "Selva de Mar, la" },
  { idescat: "431457", ine: "43145", nom: "Selva del Camp, la" },
  { idescat: "431460", ine: "43146", nom: "Senan" },
  { idescat: "430445", ine: "43044", nom: "Sénia, la" },
  { idescat: "252022", ine: "25202", nom: "Senterada" },
  { idescat: "250352", ine: "25035", nom: "Sentiu de Sió, la" },
  { idescat: "082671", ine: "08267", nom: "Sentmenat" },
  { idescat: "171903", ine: "17190", nom: "Serinyà" },
  { idescat: "252043", ine: "25204", nom: "Seròs" },
  { idescat: "171910", ine: "17191", nom: "Serra de Daró" },
  { idescat: "171925", ine: "17192", nom: "Setcases" },
  { idescat: "252038", ine: "25203", nom: "Seu d'Urgell, la" },
  { idescat: "082690", ine: "08269", nom: "Seva" },
  { idescat: "252056", ine: "25205", nom: "Sidamon" },
  { idescat: "171931", ine: "17193", nom: "Sils" },
  { idescat: "082704", ine: "08270", nom: "Sitges" },
  { idescat: "170524", ine: "17052", nom: "Siurana" },
  { idescat: "082711", ine: "08271", nom: "Sobremunt" },
  { idescat: "252069", ine: "25206", nom: "Soleràs, el" },
  { idescat: "431476", ine: "43147", nom: "Solivella" },
  { idescat: "252075", ine: "25207", nom: "Solsona" },
  { idescat: "082726", ine: "08272", nom: "Sora" },
  { idescat: "252081", ine: "25208", nom: "Soriguera" },
  { idescat: "252094", ine: "25209", nom: "Sort" },
  { idescat: "252108", ine: "25210", nom: "Soses" },
  { idescat: "082732", ine: "08273", nom: "Subirats" },
  { idescat: "252115", ine: "25211", nom: "Sudanell" },
  { idescat: "252120", ine: "25212", nom: "Sunyer" },
  { idescat: "082747", ine: "08274", nom: "Súria" },
  { idescat: "171946", ine: "17194", nom: "Susqueda" },
  { idescat: "082763", ine: "08276", nom: "Tagamanent" },
  { idescat: "082779", ine: "08277", nom: "Talamanca" },
  { idescat: "252154", ine: "25215", nom: "Talarn" },
  { idescat: "252167", ine: "25216", nom: "Talavera" },
  { idescat: "171959", ine: "17195", nom: "Tallada d'Empordà, la" },
  { idescat: "082785", ine: "08278", nom: "Taradell" },
  { idescat: "431482", ine: "43148", nom: "Tarragona" },
  { idescat: "252173", ine: "25217", nom: "Tàrrega" },
  { idescat: "252189", ine: "25218", nom: "Tarrés" },
  { idescat: "252192", ine: "25219", nom: "Tarroja de Segarra" },
  { idescat: "082750", ine: "08275", nom: "Tavèrnoles" },
  { idescat: "082802", ine: "08280", nom: "Tavertet" },
  { idescat: "082819", ine: "08281", nom: "Teià" },
  { idescat: "252206", ine: "25220", nom: "Térmens" },
  { idescat: "171962", ine: "17196", nom: "Terrades" },
  { idescat: "082798", ine: "08279", nom: "Terrassa" },
  { idescat: "082824", ine: "08282", nom: "Tiana" },
  { idescat: "252213", ine: "25221", nom: "Tírvia" },
  { idescat: "252228", ine: "25222", nom: "Tiurana" },
  { idescat: "431495", ine: "43149", nom: "Tivenys" },
  { idescat: "431508", ine: "43150", nom: "Tivissa" },
  { idescat: "082830", ine: "08283", nom: "Tona" },
  { idescat: "252234", ine: "25223", nom: "Torà" },
  { idescat: "082845", ine: "08284", nom: "Tordera" },
  { idescat: "082858", ine: "08285", nom: "Torelló" },
  { idescat: "252249", ine: "25224", nom: "Torms, els" },
  { idescat: "252252", ine: "25225", nom: "Tornabous" },
  { idescat: "252271", ine: "25227", nom: "Torre de Cabdella, la" },
  { idescat: "082861", ine: "08286", nom: "Torre de Claramunt, la" },
  { idescat: "431515", ine: "43151", nom: "Torre de Fontaubella, la" },
  { idescat: "431520", ine: "43152", nom: "Torre de l'Espanyol, la" },
  { idescat: "252332", ine: "25233", nom: "Torre-serona" },
  { idescat: "252265", ine: "25226", nom: "Torrebesses" },
  { idescat: "431536", ine: "43153", nom: "Torredembarra" },
  { idescat: "252287", ine: "25228", nom: "Torrefarrera" },
  { idescat: "259078", ine: "25907", nom: "Torrefeta i Florejacs" },
  { idescat: "252304", ine: "25230", nom: "Torregrossa" },
  { idescat: "252311", ine: "25231", nom: "Torrelameu" },
  { idescat: "082877", ine: "08287", nom: "Torrelavit" },
  { idescat: "082883", ine: "08288", nom: "Torrelles de Foix" },
  { idescat: "082896", ine: "08289", nom: "Torrelles de Llobregat" },
  { idescat: "171978", ine: "17197", nom: "Torrent" },
  { idescat: "252326", ine: "25232", nom: "Torres de Segre" },
  { idescat: "171984", ine: "17198", nom: "Torroella de Fluvià" },
  { idescat: "171997", ine: "17199", nom: "Torroella de Montgrí" },
  { idescat: "431541", ine: "43154", nom: "Torroja del Priorat" },
  { idescat: "172001", ine: "17200", nom: "Tortellà" },
  { idescat: "431554", ine: "43155", nom: "Tortosa" },
  { idescat: "172018", ine: "17201", nom: "Toses" },
  { idescat: "172023", ine: "17202", nom: "Tossa de Mar" },
  { idescat: "252347", ine: "25234", nom: "Tremp" },
  { idescat: "172044", ine: "17204", nom: "Ullà" },
  { idescat: "082900", ine: "08290", nom: "Ullastrell" },
  { idescat: "172057", ine: "17205", nom: "Ullastret" },
  { idescat: "431567", ine: "43156", nom: "Ulldecona" },
  { idescat: "431573", ine: "43157", nom: "Ulldemolins" },
  { idescat: "172039", ine: "17203", nom: "Ultramort" },
  { idescat: "172060", ine: "17206", nom: "Urús" },
  { idescat: "082917", ine: "08291", nom: "Vacarisses" },
  { idescat: "170144", ine: "17014", nom: "Vajol, la" },
  { idescat: "172076", ine: "17207", nom: "Vall d'en Bas, la" },
  { idescat: "172082", ine: "17208", nom: "Vall de Bianya, la" },
  { idescat: "250432", ine: "25043", nom: "Vall de Boí, la" },
  { idescat: "259010", ine: "25901", nom: "Vall de Cardós" },
  { idescat: "172095", ine: "17209", nom: "Vall-llobrega" },
  { idescat: "082922", ine: "08292", nom: "Vallbona d'Anoia" },
  { idescat: "252385", ine: "25238", nom: "Vallbona de les Monges" },
  { idescat: "082938", ine: "08293", nom: "Vallcebre" },
  { idescat: "431589", ine: "43158", nom: "Vallclara" },
  { idescat: "252402", ine: "25240", nom: "Vallfogona de Balaguer" },
  { idescat: "171707", ine: "17170", nom: "Vallfogona de Ripollès" },
  { idescat: "431592", ine: "43159", nom: "Vallfogona de Riucorb" },
  { idescat: "082943", ine: "08294", nom: "Vallgorguina" },
  { idescat: "082956", ine: "08295", nom: "Vallirana" },
  { idescat: "431606", ine: "43160", nom: "Vallmoll" },
  { idescat: "082969", ine: "08296", nom: "Vallromanes" },
  { idescat: "431613", ine: "43161", nom: "Valls" },
  { idescat: "259062", ine: "25906", nom: "Valls d'Aguilar, les" },
  { idescat: "252398", ine: "25239", nom: "Valls de Valira, les" },
  {
    idescat: "431628",
    ine: "43162",
    nom: "Vandellòs i l'Hospitalet de l'Infant"
  },
  { idescat: "259097", ine: "25909", nom: "Vansa i Fórnols, la" },
  { idescat: "082975", ine: "08297", nom: "Veciana" },
  { idescat: "431634", ine: "43163", nom: "Vendrell, el" },
  { idescat: "172109", ine: "17210", nom: "Ventalló" },
  { idescat: "252424", ine: "25242", nom: "Verdú" },
  { idescat: "172116", ine: "17211", nom: "Verges" },
  { idescat: "431649", ine: "43164", nom: "Vespella de Gaià" },
  { idescat: "082981", ine: "08298", nom: "Vic" },
  { idescat: "172121", ine: "17212", nom: "Vidrà" },
  { idescat: "172137", ine: "17213", nom: "Vidreres" },
  { idescat: "252430", ine: "25243", nom: "Vielha e Mijaran" },
  { idescat: "431704", ine: "43170", nom: "Vila-rodona" },
  { idescat: "172305", ine: "17230", nom: "Vila-sacra" },
  { idescat: "252521", ine: "25252", nom: "Vila-sana" },
  { idescat: "431711", ine: "43171", nom: "Vila-seca" },
  { idescat: "431652", ine: "43165", nom: "Vilabella" },
  { idescat: "172142", ine: "17214", nom: "Vilabertran" },
  { idescat: "172155", ine: "17215", nom: "Vilablareix" },
  { idescat: "082994", ine: "08299", nom: "Vilada" },
  { idescat: "172174", ine: "17217", nom: "Viladamat" },
  { idescat: "172168", ine: "17216", nom: "Viladasens" },
  { idescat: "083015", ine: "08301", nom: "Viladecans" },
  { idescat: "083008", ine: "08300", nom: "Viladecavalls" },
  { idescat: "172180", ine: "17218", nom: "Vilademuls" },
  { idescat: "172207", ine: "17220", nom: "Viladrau" },
  { idescat: "172214", ine: "17221", nom: "Vilafant" },
  { idescat: "083054", ine: "08305", nom: "Vilafranca del Penedès" },
  { idescat: "252445", ine: "25244", nom: "Vilagrassa" },
  { idescat: "172235", ine: "17223", nom: "Vilajuïga" },
  { idescat: "431750", ine: "43175", nom: "Vilalba dels Arcs" },
  { idescat: "083067", ine: "08306", nom: "Vilalba Sasserra" },
  { idescat: "252458", ine: "25245", nom: "Vilaller" },
  { idescat: "172240", ine: "17224", nom: "Vilallonga de Ter" },
  { idescat: "431665", ine: "43166", nom: "Vilallonga del Camp" },
  { idescat: "172253", ine: "17225", nom: "Vilamacolum" },
  { idescat: "172266", ine: "17226", nom: "Vilamalla" },
  { idescat: "172272", ine: "17227", nom: "Vilamaniscle" },
  { idescat: "252477", ine: "25247", nom: "Vilamòs" },
  { idescat: "172288", ine: "17228", nom: "Vilanant" },
  { idescat: "431671", ine: "43167", nom: "Vilanova d'Escornalbou" },
  { idescat: "252483", ine: "25248", nom: "Vilanova de Bellpuig" },
  { idescat: "252496", ine: "25249", nom: "Vilanova de l'Aguda" },
  { idescat: "252542", ine: "25254", nom: "Vilanova de la Barca" },
  { idescat: "252509", ine: "25250", nom: "Vilanova de Meià" },
  { idescat: "431687", ine: "43168", nom: "Vilanova de Prades" },
  { idescat: "083036", ine: "08303", nom: "Vilanova de Sau" },
  { idescat: "252516", ine: "25251", nom: "Vilanova de Segrià" },
  { idescat: "083020", ine: "08302", nom: "Vilanova del Camí" },
  { idescat: "089024", ine: "08902", nom: "Vilanova del Vallès" },
  { idescat: "083073", ine: "08307", nom: "Vilanova i la Geltrú" },
  { idescat: "431690", ine: "43169", nom: "Vilaplana" },
  { idescat: "082140", ine: "08214", nom: "Vilassar de Dalt" },
  { idescat: "082191", ine: "08219", nom: "Vilassar de Mar" },
  { idescat: "172229", ine: "17222", nom: "Vilaür" },
  { idescat: "431726", ine: "43172", nom: "Vilaverd" },
  { idescat: "431732", ine: "43173", nom: "Vilella Alta, la" },
  { idescat: "431747", ine: "43174", nom: "Vilella Baixa, la" },
  { idescat: "172333", ine: "17233", nom: "Vilobí d'Onyar" },
  { idescat: "083041", ine: "08304", nom: "Vilobí del Penedès" },
  { idescat: "172327", ine: "17232", nom: "Vilopriu" },
  { idescat: "252537", ine: "25253", nom: "Vilosell, el" },
  { idescat: "431763", ine: "43176", nom: "Vimbodí i Poblet" },
  { idescat: "252555", ine: "25255", nom: "Vinaixa" },
  { idescat: "431779", ine: "43177", nom: "Vinebre" },
  { idescat: "431785", ine: "43178", nom: "Vinyols i els Arcs" },
  { idescat: "083089", ine: "08308", nom: "Viver i Serrateix" },
  { idescat: "430521", ine: "43052", nom: "Xerta" }
]
const hoveredPolygonId = null
const transformedData2 = muni_table.map(item => ({
  ...item,
  codimun: item.ine,  // Renombrar "ine" a "codimun"
  ine: undefined       // Eliminar "ine"
}));

const mergedData = transformedData2.map(item => {
    const match = normalizedData.find(n => String(n.codimun) === String(item.codimun));
    return {
        ...item,
        consumption: match ? match.consumption : null  // Si no hi ha consum, en null
    };
});

const mergedData1 = mergedData.map(({ codimun, ...rest }) => ({
  idescat: codimun, // Renombrar 'idescat' a 'codimun'
  ...rest // Mantenir les altres propietats
}));

const mergedData2 = mergedData1.map(({ idescat, ...rest }) => {
  // Mapejar les dades i renombrar 'idescat' a 'codimun'
  let updatedData = {
    codimun: idescat, // Renombrar 'idescat' a 'codimun'
    ...rest, // Mantenir les altres propietats
  };

  // Verificar les propietats específiques i assignar null si son invàlides o null
  Object.keys(updatedData).forEach(key => {
    // Assignar null si el valor es nul, undefined o 0
    if (updatedData[key] === null || updatedData[key] === undefined || updatedData[key] === 0) {
      updatedData[key] = 0;
    }
  });
  return updatedData;
});

// Mapa
const simple = window.ss; // Accedir a simple-statistics

// Token d'accès per poder utilitzar els serveis de MapBox
const accessToken = "pk.eyJ1IjoiZm5kdml0IiwiYSI6ImNrYzBzYjhkMDBicG4yc2xrbnMzNXVoeDIifQ.mrdvw_7AIeOwa5IgHLaHJg";

// Generar una expressió de colors que s'utilitza en Mapbox per pintar els municipis segons el seu consum d'energia.
const createColorExpression = (data, id, join, scheme) => {
    // Obtenim els identificadors i propietats necessàries per fer la unió
    const { id: idJoin, prop: propJoin } = join;
    const { domain, range } = scheme;
    // Creem una llista de colors combinant valors de domini i rang
    const colors = range.flatMap((color, index) => {
        return index < domain.length ? [color, domain[index]] : [color];
    });
    // Inicialitzem l'expressió de color amb la funció "step"
    const colorExpression = ["step", ["get", propJoin], ...colors];
    // Creem una expressió de coincidència per assignar valors de color segons el municipi
    const matchExpression = ["match", ["get", id]];
    // Afegim cada municipi i el seu valor associat a la funció "match"
    data.forEach((entry) => {
        matchExpression.push(entry[idJoin], entry[propJoin]);
    });
    // Assignem un valor per defecte (0) en cas que no hi hagi coincidència
    matchExpression.push(0);
    // Substituïm la part de la funció "step" amb l'expressió de coincidència
    colorExpression[1] = matchExpression;
    return colorExpression;
}

//Generar intervals òptims a partir de dades de consum d'energia utilitzant l'algorisme k-means clustering.
function generateKMeansBreaks(data, numClusters) {
    // Creem un array només amb els valors de consum d'energia
    const emissionsArray = data.map(d => d.consumption);
    try {
        // Apliquem l'algorisme de clustering k-means per agrupar els valors en diferents intervals
        const clusters = simple.ckmeans(emissionsArray, numClusters);

        // Creem un objecte de binning (agrupació) de D3 per generar els llindars dels intervals
        const ckmeans = d3
            .bin()
            .thresholds(clusters.map((d) => d3.min(d))) // Usem el valor mínim de cada clúster com a llindar
            .value((d) => d)(emissionsArray); // Apliquem el binning sobre les emissions

        // Extreiem els valors inicials de cada interval generat per l'algorisme
        const ckmeansBreaks = ckmeans.map((d) => d.x0);
        return ckmeansBreaks; // Retornem els llindars calculats
    } catch (error) {
        console.error("Error en generateKMeansBreaks:", error);
        return []; // Retornem un array buit en cas d'error
    }
  }

  // Genera els llindars per als clústers K-means utilitzant les dades del consum
  const ckmeansBreaks = generateKMeansBreaks(mergedData2, 7);
  //Mapa per veure el consum d'energia per càpita de cada municipi.
  function initializeMap() {
      const map = new mapboxgl.Map({
          container: "map",
          accessToken: accessToken,
          style: "mapbox://styles/fndvit/clvnpq95k01jg01qz1px52jzf",
          center: [2.5, 41.5],
          zoom: 6.5,
          minZoom: 5,
          maxZoom: 14,
          maxBounds: [[-0.9, 39.6], [4.5, 44.3]]
      });

      let hoveredPolygonId = null;
      let popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

      map.on("load", function () {
          map.addSource("municipis", {
              type: "vector",
              url: "mapbox://fndvit.0lp3ykob",
              promoteId: "CODIMUNI"
          });

        map.addLayer({
            id: "municipis-fill",
            type: "fill",
            source: "municipis",
            "source-layer": "municipis-cck7ln",
            paint: {
                "fill-color": createColorExpression(
                    mergedData2,
                    "CODIMUNI",
                      {
                        id: "codimun",
                        prop: "consumption"
                      },
                      {
                        domain: ckmeansBreaks.slice(1, ckmeansBreaks.length),
                        range: [
                            "#ffeda0",
                            "#fed976",
                            "#feb24c",
                            "#fd8d3c",
                            "#fc4e2a",
                            "#e31a1c",
                            "#b10026"
                        ]
                      }
                )
              }
          },
          "tunnel-simple"
          );


        map.addLayer({
            id: "municipis-line",
            type: "line",
            source: "municipis",
            "source-layer": "municipis-cck7ln",
             paint: {
                  "line-color": "#000000",
                  "line-width": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    1,
                    0
                  ]
            }
          },
          "settlement-subdivision-label"
          );

          // Evento al pasar el mouse
          map.on("mousemove", "municipis-fill", (e) => {
              if (e.features.length > 0) {
                  if (hoveredPolygonId !== null) {
                    map.setFeatureState(
                      {
                        source: "municipis",
                        sourceLayer: "municipis-cck7ln",
                        id: hoveredPolygonId
                      },
                      { hover: false }
                    );
                  }

                  hoveredPolygonId = e.features[0].id;

                  // Obtener datos del municipio
                  const codimun = e.features[0].properties.CODIMUNI;
                  const municipio = mergedData2.find(m => m.codimun === codimun);
                  const consumo = municipio ? municipio.consumption : "N/A";
                  const nombre = municipio ? municipio.nom : "Desconocido";

                  // Mostrar popup
                  if (consumo === 0) {
                    popup
                      .setLngLat(e.lngLat)
                      .setHTML(`<strong>${nombre}</strong><br>No hi ha dades`)
                      .addTo(map);
                  } else if (consumo !== null) {
                    popup
                      .setLngLat(e.lngLat)
                      .setHTML(`<strong>${nombre}</strong><br>Consum per capita: ${consumo.toFixed(2)} kWh`)
                      .addTo(map);
                  }

                  map.setFeatureState(
                    {
                      source: "municipis",
                      sourceLayer: "municipis-cck7ln",
                      id: hoveredPolygonId
                    },
                    { hover: true }
                  );
                }
            });

            // Evento al salir del municipio
            map.on("mouseleave", "municipis-fill", () => {
                if (hoveredPolygonId !== null) {
                  map.setFeatureState(
                    {
                      source: "municipis",
                      sourceLayer: "municipis-cck7ln",
                      id: hoveredPolygonId
                    },
                    { hover: false }
                  );
                }
                hoveredPolygonId = null;
                popup.remove();
              });
            });  
            window.onbeforeunload = () => {
                map.remove();
            };
        }

        selectorSectorInput.addEventListener("change", initializeMap);
        document.addEventListener("DOMContentLoaded", () => {
            groupBySectorAndMunicipi(selectorSector, selectYear);
            normalizeDataForMap(consumptionByMunicipi, poblacionFiltrada);
            generateKMeansBreaks(mergedData2, 7)
            initializeMap();
        });
```

```js
  const agregaProvincia = Inputs.checkbox([""], {label: "Agrega per província"});
  const agregaProvinciaValue = Generators.input(agregaProvincia);

  const tableSearch = Inputs.search(
    agregaProvinciaValue.length == 1 ? consum_energia_electrica_data : consum_energia_electrica_data, 
    {placeholder: `Entra un nom de ${agregaProvinciaValue.length == 1 ? "província" : "comarca"}`}
  );

  const tableSearchValue = view(tableSearch);
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

<!-- Mapa municipal segons el consum total per sector i any seleccionat -->
<div class="grid grid-cols-2 gap-4 mt-4">
  <!-- Mapa municipal segons el consum total per sector i any seleccionat -->
  <div class="card p-4">
    <h1>Distribució del consum elèctric municipal per sector (${selectYear})</h1>${selectorSectorInput} 
      <div id="map" style="height: 720px;"></div> 
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

<!-- Taula de energia elèctrica -->
<div class="card">
  <h2>Consulta la taula per ${agregaProvinciaValue.length == 1 ? "provincia" : "comarca"}</h2>
  ${agregaProvincia}${display(tableSearch)}${display(Inputs.table(tableSearchValue, {
    format: {
      "Any": d => String(d), // Mostrar el año como texto
      "Consum KWh": d => d.toLocaleString('ca-ES'), // Mostrar consumo con separador de miles
      "Descripció sector": d => d, // Mostrar descripción de sector tal como está
    },
    columns: [
      agregaProvinciaValue.length == 1 ? "provincia" : "comarca", // Alterna entre provincia o comarca
      "any", // Año
      "descripcio_sector", // Descripción del sector
      "consum_kwh", // Consumo en kWh
    ]
  }))}  
</div>



<p class="notes">Desenvolupat per en <strong>Marc Serrano Touil</strong>. Aquest panell de dades és una nova visualització del consum d’energia elèctrica per municipis i sectors de Catalunya</a> de l'${attribution}, utilitzant les <a href="https://analisi.transparenciacatalunya.cat/Energia/Consum-d-energia-el-ctrica-per-municipis-i-sectors/8idm-becu/about_data">dades obertes disponibles</a> al portal de Transparència. Tota la informació es comparteix sota la llicència 
  <a href="https://administraciodigital.gencat.cat/ca/dades/dades-obertes/informacio-practica/llicencies/" target="_blank">llicència oberta</a>.</p>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">

  <i class="fa-solid fa-eye"></i> ${view_count} visualitzacions &nbsp;&nbsp; 
  <i class="fa-solid fa-download"></i> ${download_count} descàrregues