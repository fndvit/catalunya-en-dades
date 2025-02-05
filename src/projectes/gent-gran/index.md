```js
const population = FileAttachment("data/population.json").json();
const comarques_catalunya = FileAttachment("data/comarques_catalunya.json").json();
````

```js
const nom_comarques = comarques_catalunya.features.map(d => d.properties.NOMCOMAR);
```

```js
function set(input, value) {
    input.value = value;
    input.dispatchEvent(new Event("input", {bubbles: true}));
}
```

```js
const latest_year = Math.max.apply(Math, population.map(row => row.year));
const comarques_latest_population = Object.fromEntries(
    population
        .filter(row => row.year === latest_year)
        .map(row => Array(row.nom_comarca, Math.round(row.population_over_65 * 1000.0 / row.population) / 10.0)))
```

```js
const nom_comarca_input = Inputs.select(
    comarques_catalunya.features.map((d) => d.properties.NOMCOMAR),
    {
        sort: true,
        unique: true,
        label: "Nom Comarca",
        value: "Alt Camp"
    }
);
const nom_comarca = Generators.input(nom_comarca_input);
```

```js

const plot_catalunya_map_aged_65 = (width) => {
    return Plot.plot({
        projection: {
            type: "conic-conformal",
            domain: comarques_catalunya
        },
        color: {
            type: "threshold",
            scheme: "buylrd",
            legend: true,
            pivot: 17.96,
            n: 10,
            unknown: "black",
            domain: [14, 16, 18, 20, 22, 24, 26, 30],
            label: "Població de 65 anys i més (%)",
        },
        width: width,
        marks: [
            Plot.geo(comarques_catalunya, {
                fill: (d) => comarques_latest_population[d.properties.NOMCOMAR],
                title: d => d.properties.NOMCOMAR,
                strokeOpacity: 1.0,
                strokeWidth: 1,
                stroke: "black",
                tip: true
            })


        ]
    });
};

```

# Gent Gran

<div class="grid grid-cols-4">
    <div class="card grid-colspan-2">
        <h2>Població de 65 anys i més (%)</h2>
El següent mapa de Catalunya mostra cada comarca amb aquest indicador analitzat per a l'any més recent.
El valor central representa la mitjana d'Espanya, que és del 21% d'aquest indicador.
Com a referència addicional, la mediana global se situa en el 10%.
        <figure class="grafic" style="max-width: none;">
            ${resize((width) => plot_catalunya_map_aged_65(width))}
        </figure>
    </div>
    
</div>
