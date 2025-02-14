```js
const population = FileAttachment("data/population.json").json();
const comarques_catalunya = FileAttachment("data/comarques_catalunya.json").json();
const entities_df = FileAttachment("data/entitats_serveis_establiments_socials.json").json();

````

```js
const latest_year = Math.max(...population.map(single_object => single_object.year));
const total_population_latest_year = population.filter(single_object => single_object.year == latest_year).reduce((accumulative_population, single_object) => single_object.population + accumulative_population, 0);
const gent_gran_population_latest_year = population.filter(single_object => single_object.year == latest_year).reduce((accumulative_population, single_object) => single_object.population_over_65 + accumulative_population, 0);
const latest_indicator_average_catalunya = Math.round(gent_gran_population_latest_year * 1000 / total_population_latest_year) / 10.0
const latest_indicator_average_catalunya_integer = Math.round(latest_indicator_average_catalunya);
const range_colours_indicator = [...Array(8).keys()].map(i => latest_indicator_average_catalunya_integer - 7 + i * 2)
const reference_year = population.reduce((closest_year, single_object) => Math.abs(single_object.year - 2000) < Math.abs(closest_year - 2000) ? single_object.year : closest_year, latest_year);
console.log(reference_year);
```

```js
const nom_comarques = comarques_catalunya.features.map(d => d.properties.NOMCOMAR);
const catalunya_indicator_or_variation_input = Inputs.radio(new Map([["Percentatge de la població de 65 anys o més", true],
        [`Variació % població 65 anys o més entre els anys ${latest_year} i ${reference_year}`, false]]),
    {value: true, label: "Indicador"});
const catalunya_indicator_or_variation = Generators.input(catalunya_indicator_or_variation_input);
```

```js
const color_catalunya_map = catalunya_indicator_or_variation ? {
    type: "threshold",
    scheme: "buylrd",
    legend: true,
    pivot: latest_indicator_average_catalunya_integer,
    n: 10,
    unknown: "grey",
    domain: range_colours_indicator,
    label: "Percentatge de la població de 65 anys o més",
} : {
    type: "diverging",
    scheme: "buylrd",
    legend: true,
    pivot: 0,
    n: 10,
    unknown: "grey",
    label: "Variació % població 65 anys o més, 2023 vs 2001",
};
```

```js
function set(input, value) {
    input.value = value;
    input.dispatchEvent(new Event("input", {bubbles: true}));
}
```

```js
const comarques_latest_population = Object.fromEntries(
    population
        .filter(row => row.year === latest_year)
        .map(row => Array(row.nom_comarca, Math.round(row.population_over_65 * 1000.0 / row.population) / 10.0)))
```

```js
const comarques_reference_population = Object.fromEntries(
    population
        .filter(row => row.year === reference_year)
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
const single_comarca_population_input = Inputs.radio(new Map([["Tendència de la població de 65 anys o més", true],
        ["Tendència de l'indicador de població de 65 anys o més", false]]),
    {value: true, label: null});
const single_comarca_population = Generators.input(single_comarca_population_input);
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
            aggregation: "indicator_elderly",
            population: Math.round(row.population_over_65 * 1000.0 / row.population)/10.0 
        }))
}).sort((a, b) => {
    if (a.aggregation == b.aggregation) {
        return a.year - b.year;
    } else {
        if (a.aggregation == "population_over_65") {
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
        color: color_catalunya_map,
        width: width,
        marks: [
            Plot.geo(comarques_catalunya, {
                fill: (d) => comarques_latest_population[d.properties.NOMCOMAR] - (catalunya_indicator_or_variation? 0 : comarques_reference_population[d.properties.NOMCOMAR]),
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
            label: single_comarca_population ? "Població de 65 anys o més": "Percentatge de la població de 65 anys o més",
        },
        color: {
            domain: single_comarca_population ? ["population_over_65"] : ["indicator_elderly"],
            range: single_comarca_population ? ["#ffd754"] : ["#3b5fc0"],
            legend: true,
            columns: 1,
            rows: 2,
            label: null,
            tickFormat: d => d === "population_over_65" ? "Població de 65 anys o més" : "Percentatge de la població de 65 anys o més"
        },
        x: {
            grid: true,
            tickFormat: d => d.toString(),
            label: null
        },
        marks: [
            Plot.lineY(population_data_single_comarca.filter(row => row.aggregation == (single_comarca_population? "population_over_65" : "indicator_elderly")),
                {x: "year", y: "population", strokeWidth: 4, stroke: "aggregation"}),
            Plot.ruleY([0])
        ]
    })
}
```

```js
const nom_comarca_services_input = Inputs.select(
    entities_df.entities_comarca_acumulative.map((d) => d.comarca),
    {
        sort: true,
        unique: true,
        label: "Nom Comarca",
        value: "Alt Camp"
    }
);
const nom_comarca_services = Generators.input(nom_comarca_services_input);

const linear_scale_y_axis_input = Inputs.radio(new Map([["Escala lineal", true],
        ["Escala logarítmica", false]]),
    {value: true, label: "Escala del gràfic:"});
const linear_scale_y_axis = Generators.input(linear_scale_y_axis_input);

const service_tag_to_complete = new Map([["Servei de centre de dia", "Servei de centre de dia per a gent gran de caràcter temporal o permanent"],
    ["Servei de residència assistida", "Servei de residència assistida per a gent gran de caràcter temporal o permanent"],
    ["Servei de llar residència", "Servei de llar residència per a gent gran de caràcter temporal o permanent"],
    ["Servei de tutela", "Servei de tutela per a gent gran"],
    ["Servei d' habitatge tutelat", "Servei d' habitatge tutelat per a gent gran de caràcter temporal o permanent"]]);
const all_services = Array.from(service_tag_to_complete.entries()).map(k => k[1]);

const serveis_input = Inputs.checkbox(service_tag_to_complete, {
    value: ["Servei de residència assistida per a gent gran de caràcter temporal o permanent"],
    label: "Servei"
})
const serveis_selected = Generators.input(serveis_input)
```

```js
const serveis_to_use = (serveis_selected.length == 0) ? all_services : serveis_selected;
```

```js
const target_population = population.filter(row => row.nom_comarca == nom_comarca_services).sort((a, b) => a.year - b.year)

const serveis_by_comarca = entities_df.entities_comarca_acumulative.filter(d => d.comarca == nom_comarca_services);
const serveis_by_iniciative = entities_df.entities_comarca_qualificacion_acumulative.filter(d => d.comarca == nom_comarca_services & (serveis_to_use.includes(d.tipologia))).sort((a, b) => {
    if (a.qualificacio == b.qualificacio) {
        return a.year - b.year;
    } else {
        if (a.qualificacio == "null") {
            return 1;
        } else {
            if (b.qualificacio == "null") {
                return -1;
            } else {
                if (a.qualificacio == "Entitat d'iniciativa pública") {
                    return -1;
                } else {
                    if (b.qualificacio == "Entitat d'iniciativa pública") {
                        return 1;
                    } else {
                        return -a.qualificacio.localeCompare(b.qualificacio)
                    }
                }
            }
        }
    }
})
```

```js
function fillMissingYears(data) {
    let filledData = [];
    let groupedData = {};
    data.forEach(item => {
        let key = `${item.tipologia}-${item.comarca}-${item.qualificacio}`;
        if (!groupedData[key]) groupedData[key] = [];
        groupedData[key].push(item);
    });
    const min_year = Math.min(...data.map(d => d.year));
    console.log(min_year);
    Object.values(groupedData).forEach(group => {
        group.sort((a, b) => a.year - b.year);
        let lastEntry = null;

        for (let year = min_year; year <= 2024; year++) {
            let entry = group.find(item => item.year === year);
            if (entry) {
                filledData.push(entry);
                lastEntry = entry;
            } else {
                if (lastEntry) {
                    filledData.push({
                        tipologia: lastEntry.tipologia,
                        comarca: lastEntry.comarca,
                        year: year,
                        qualificacio: lastEntry.qualificacio,
                        capacitat: 0,
                        cumulative_count: lastEntry.cumulative_count
                    });
                } else {
                    filledData.push({
                        tipologia: group[0].tipologia,
                        comarca: group[0].comarca,
                        year: year,
                        qualificacio: group[0].qualificacio,
                        capacitat: 0,
                        cumulative_count: 0
                    });
                }
            }
        }
    });

    return filledData;
}
```

```js
const serveis_by_iniciative_filled_missing_years = fillMissingYears(serveis_by_iniciative);
```

```js
const plot_comarca_by_serveis = (width) => {
    return Plot.plot({
        marginLeft: 50,
        width: width,
        y: {
            type: linear_scale_y_axis ? "linear" : "log",
            grid: true,
            label: "Població i capacitat del servei",
        },
        color: {
            domain: ["Població de la comarca de 65 anys i més"].concat(all_services),
            range: ["#ffd754",
                "#a160af",
                "#ff9c38",
                "#f794b9",
                "#61b0ff",
                "#a87a54"],
            legend: true,
            columns: 2,
            label: "Age Groups",
        },
        x: {
            label: null,
            grid: true,
            tickFormat: d => d.toString()
        },
        marks: [
            Plot.lineY(serveis_by_comarca,
                {x: "year", y: "cumulative_count", z: "tipologia", stroke: "tipologia", tip: "x", strokeWidth: 2}),
            Plot.lineY(target_population, {x: "year", y: d => d.population_over_65, stroke: "#ffd754", strokeWidth: 3})
        ]
    })
};

const plot_services_comarca_by_iniciatives = (width) => {
    return Plot.plot((() => {
        const n = 1;
        const keys = Array.from(d3.union(serveis_by_iniciative_filled_missing_years.map((d) => d.tipologia)));
        const index = new Map(keys.map((key, i) => [key, i]));
        const fx = (key) => index.get(key) % n;
        const fy = (key) => Math.floor(index.get(key) / n);
        return {
            height: width,
            axis: null,
            y: {
                insetTop: 10, grid: true,
                label: "Capacitat Acumulativa del servei"
            },
            x: {
                grid: true,
                label: null,
            },
            fx: {padding: 0.03},
            color: {

                domain: [
                    "Entitat privada d'iniciativa mercantil",
                    "Entitat privada d'iniciativa social",
                    "Entitat d'iniciativa pública"],
                range: ["#ed393f", "#5ca34b", "#3b5fc0"],
                legend: true,
                columns: 1,
                rows: 3,
                label: "Age Groups",
            },
            marks: [
                Plot.areaY(serveis_by_iniciative_filled_missing_years, {
                    x: "year",
                    y: "cumulative_count",
                    fill: "qualificacio",
                    fx: (d) => fx(d.tipologia),
                    fy: (d) => fy(d.tipologia)
                }),
                Plot.text(keys, {fx, fy, frameAnchor: "top-left", dx: 6, dy: 6}),
                Plot.frame(),
                Plot.axisY(),
                Plot.axisX({tickFormat: d => d.toString()})
            ]
        };
    })());
}
```

# Gent Gran

<div class="grid grid-cols-3">
    <div class="card grid-colspan-3">
        ${catalunya_indicator_or_variation_input}
        <h2>${catalunya_indicator_or_variation ? "Percentatge de la població de 65 anys o més": `Variació % població 65 anys o més entre els anys ${latest_year} i ${reference_year}`}</h2>
${catalunya_indicator_or_variation ? `El següent mapa de Catalunya mostra cada comarca amb aquest indicador analitzat per a l'any ${latest_year}.
El valor central representa la mitjana de Catalunya, que és del ${latest_indicator_average_catalunya}% d'aquest indicador.
Com a referència addicional, la mediana global se situa en el 10%.`: `El següent mapa de Catalunya mostra la variació percentual de la població de 65 anys o més a cada comarca entre els anys ${latest_year} i ${reference_year}.`}
        <figure class="grafic" style="max-width: none;">
            ${resize((width) => plot_catalunya_map_aged_65(width))}
        </figure>
    </div>
</div>
<div class="grid grid-cols-3">
    <div class="card grid-colspan-1">
    Per veure la tendència demogràfica per edat d'una comarca específica, podeu seleccionar el nom de la comarca en les opcions següents o fer clic al mapa.
            ${nom_comarca_input}
            ${single_comarca_population_input}
        <h2>Tendència demogràfica per edat a ${nom_comarca}</h2>
        <figure class="grafic" style="max-width: none;">
            ${resize((width) => plot_trend_population_groups_by_comarca(width))}
        </figure>
    </div>
    <div class="card grid-colspan-1">
        ${nom_comarca_services_input}
        ${linear_scale_y_axis_input}
        <h2>Població i servei</h2>
        <figure class="grafic" style="max-width: none;">
            ${resize((width) => plot_comarca_by_serveis(width))}
        </figure>
    </div>
    <div class="card grid-colspan-1">
        ${serveis_input}
        <h2>Qualificaciò de los servei</h2>
        <figure class="grafic" style="max-width: none;">
            ${resize((width) => plot_services_comarca_by_iniciatives(width))}
        </figure>
    </div>

</div>
