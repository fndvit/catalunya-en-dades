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
const render_interaction_comarca = (index, scales, values, dimensions, context, next) => {
    const dom_element = next(index, scales, values, dimensions, context);
    const all_paths = dom_element.querySelectorAll("path");
    for (let i = 0; i < all_paths.length; i++) {
        all_paths[i].addEventListener("click", () => {
            set(nom_comarca_input, nom_comarques[index[i]]);
        });
    }
    return dom_element;
}

const population_data_single_comarca = population.filter(row => {
    return nom_comarca == row.nom_comarca;
}).flatMap(row => {
    return Array(Object({year: row.year, aggregation: "population_over_65", population: row.population_over_65}),
        Object({
            year: row.year,
            aggregation: "population_below_65",
            population: row.population - row.population_over_65
        }))
}).sort((a, b) => {
    if (a.aggregation == b.aggregation) {
        return a.year - b.year;
    } else {
        if (a.aggregation == "population_below_65") {
            return -1;
        } else {
            return 1;
        }
    }
});
```

```js

const plot_catalunya_map_aged_65 = (width) => {
    let plot = Plot.plot({
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
                tip: true,
                render: render_interaction_comarca
            })


        ]
    });

    d3.select(plot)
        .selectAll("path")
        .on("mouseover", function () {
            d3.select(this).attr("stroke-width", 4.0);
        })
        .on("mouseout", function () {
            d3.select(this).attr("stroke-width", 1.0);
        });

    d3.select(plot)
        .on("pointerenter", function () {
            d3.select(plot).selectAll("path").attr("stroke-width", 1.0);
        })
        .on("pointerleave", function () {
            d3.select(plot).selectAll("path").attr("stroke-width", 1.0);
        });
    
    return plot;

};


var plot_trend_population_groups_by_comarca = (width) => {
    return Plot.plot({
        marginLeft: 50,
        width: width,
        y: {
            grid: true,
            label: "Població",
        },
        color: {
            domain: ["population_over_65", "population_below_65"],
            range: ["#ffd754", "#3b5fc0"],
            legend: true,
            columns: 1,
            rows: 2,
            label: "Age Groups",
            tickFormat: d => d === "population_below_65" ? "Població entre 0 i 64 anys" : "Població de 65 anys i més"
        },
        x: {
            grid: true,
            tickFormat: d => d.toString(),
            label: null
        },
        marks: [
            Plot.areaY(population_data_single_comarca,
                {x: "year", y: "population", fill: "aggregation"})
        ]
    })
}
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
    <div class="card grid-colspan-2">
    Per veure la tendència demogràfica per edat d'una comarca específica, podeu seleccionar el nom de la comarca en les opcions següents o fer clic al mapa.
            ${nom_comarca_input}
        <h2>Tendència demogràfica per edat a ${nom_comarca}</h2>
        <figure class="grafic" style="max-width: none;">
            ${resize((width) => plot_trend_population_groups_by_comarca(width))}
        </figure>
    </div>
    
</div>
