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



<div class="grid grid-cols-4">
  <div class="grid-colspan-3">
    <h1>Consum d’energia elèctrica per municipis i sectors de Catalunya</h1>
    <h2 id="last-updated">Dades actualitzades a ${lastUpdated}</h2>
  </div>
</div>

<div class="grid-colspan-1">${selectYearInput}</div>
<div class="grid grid-cols-4">  

  <!-- Consum total d'energia elèctrica a Catalunya -->
  <div class="card">
    <h3 class="consum-total-energia-electrica">Consum elèctric total a Catalunya⚡</h3>
    <span class="big grid-colspan-4">${totalConsumption} TWh</span>
  </div> 

 <!-- Municipi amb més consum elèctric -->
  <div class="card">
    <h3 class="municipi-consum-electric">Municipi amb més consum🏙️</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: baseline;">
        <div class="big">${maxMunicipiName}</div>
        <div class="blue"><strong>${maxConsumptionMun} TWh</strong></div>
    </div>
  </div>
 
  
  <!-- Sector més consumidor d'energia elèctrica -->
  <div class="card">
      <h3 class="sector-mes-energia">Sector amb més consum🔋 </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: baseline;">
        <div class="big">${maxSectorName}</div>
        <div class="blue"><strong>${maxSectorPercentage} %</strong></div>
      </div>
  </div>  
   
<!-- Sector menys consumidor d'energia elèctrica -->
  <div class="card">
      <h3 class="sector-menys-energia">Sector amb menys consum🔋 </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: baseline;">
        <div class="big">${minSectorName}</div>
        <div class="blue"><strong>${minSectorPercentage} %</strong></div>
      </div>
  </div>  


</div>



<p class="notes">Desenvolupat per en <strong>Marc Serrano Touil</strong>. Aquest panell de dades és una nova visualització del consum d’energia elèctrica per municipis i sectors de Catalunya</a> de l'${attribution}, utilitzant les <a href="https://analisi.transparenciacatalunya.cat/Energia/Consum-d-energia-el-ctrica-per-municipis-i-sectors/8idm-becu/about_data">dades obertes disponibles</a> al portal de Transparència. Tota la informació es comparteix sota la llicència 
  <a href="https://administraciodigital.gencat.cat/ca/dades/dades-obertes/informacio-practica/llicencies/" target="_blank">llicència oberta</a>.</p>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">

  <i class="fa-solid fa-eye"></i> ${view_count} visualitzacions &nbsp;&nbsp; 
  <i class="fa-solid fa-download"></i> ${download_count} descàrregues