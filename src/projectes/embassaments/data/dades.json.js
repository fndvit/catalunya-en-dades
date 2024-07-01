const response = await fetch("https://analisi.transparenciacatalunya.cat/resource/gn9e-3qhr.json?$limit=32877");
if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
const data = await response.json();

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

const historic = data.map((d) => {
  const name = embassamentsShortNames[d.estaci];
  const capacity = (100 * d.volum_embassat) / d.percentatge_volum_embassat;
  const date = new Date(d.dia);
  const pct = +d.percentatge_volum_embassat;
  const level = +d.volum_embassat;
  return { name, date, pct, level, capacity };
}).sort( (a,b) => a.date - b.date);

process.stdout.write(JSON.stringify(historic));