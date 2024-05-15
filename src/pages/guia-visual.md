---
title: Una petita guia
toc: true
---

<style>
.example { position: relative; }

.example::after {
  position: absolute;
  top: .5rem;
  right: 1rem;
  font-size: 1.5rem;
}

.right::after {
  content: '\2714';
  color: var(--theme-foreground-focus);
}

.wrong::after {
  content: '\2718';
  color: var(--theme-foreground-faint);
}

.hm::after {
  content: '\1F914';
}

.happy::after {
  content: '\1F60A';
}

.nopad {
  padding-top: 0;
  margin-top: 0;
}

.caption {
  font-size: .8rem;
  color: var(--theme-foreground-alt);
}

</style>

```js

const margarine = [8.2,7,6.5,5.3,5.2,4,4.6,4.5,4.2,3.7,];
const divorces = [5,4.7,4.6,4.4,4.3,4.1,4.2,4.2,4.2,4.1,];

const remap = d3.scaleLinear(d3.extent(divorces), d3.extent(margarine));

```

# Una petita guia
- **Redisseny per a la millora**: Començar amb les mateixes preguntes que una visualització existent i plantejar solucions visuals millorades. Contextualitzar amb aixó: https://medium.com/@hint_fm/design-and-redesign-4ab77206cf9

## Recomenacions pràctiques
Organitza el panell de dades amb un **fluix narratiu lògic**. Comença amb una visió general o resum a dalt, donant context, i continua amb la informació més detallada a sota. Això ajuda els usuaris a comprendre el context general abans d'endinsar-se en els detalls específics.

### Títol del panell
<div class="grid grid-cols-4">
  <div class="card grid-colspan-3 grid-rowspan-4">Gràfic principal</div>
  <div class="card grid-colspan-1">Dada destacada</div>
  <div class="card grid-colspan-1">Dada destacada</div>
  <div class="card grid-colspan-1">Dada destacada</div>
  <div class="card grid-colspan-1">Dada destacada</div>
</div>
<div class="grid grid-cols-4">
  <div class="card grid-colspan-4 grid-rowspan-2">Gràfic de detall</div>
  <div class="card grid-colspan-4">Taula</div>
</div>

---
TK TK Visual hierarchy

---
Crida l'atenció a les **mètriques i tendències més importants** utilitzant indicadors visuals com ara fonts en negreta o mides més grans. Destacar aquestes dades facilita que els usuaris trobin la informació clau més aviat.
<div class="grid grid-cols-4">
  <div class="card grid-colspan-1"><h1>1</h1> gat blanc i negre</div>
  <div class="card grid-colspan-1"><h1>23</h1> nenxs</div>
  <div class="card grid-colspan-1"><h1>45</h1> anys</div>
  <div class="card grid-colspan-1"><h1>6.789</h1> m³</div>
</div>

---
Evita sobrecarregar les targetes amb massa informació. Cada targeta ha de centrar-se en un punt únic.

---
Assegura't que la **relació d'aspecte dels teus gràfics** no distorsiona els patrons de les dades. Gràfics massa amples o massa estrets poden portar a interpretacions errònies. El format 4×3 (apaïsat) o 3×4 (vertical) potser son els més comuns i prudents, però també pots fer servir l'1×1 pels diagrames de dispersió, o formats més extrems: molt vertical si son moltes barres horitzontal apilades, molt apaïsat si es una serie temporal molt llarga i detallada.
<div class="grid grid-cols-4">
  <div class="card example wrong grid-colspan-3"><h1>10</h1></div>
  <div class="card example right grid-colspan-1"><h1>20</h1></div>
</div>

---
Col·loca els **filtres, desplegables i altres elements d'input dins de la mateixa targeta que el gràfic** que modifiquen. Això fa que sigui intuïtiu per als usuaris veure com la interacció amb aquest elements afecta la visualització de dades, fent la experiència més fluida i eficient. Ens 🥰 els panells interactius: permeten als usuaris fer i respondre preguntes, i descobrir històries de manera independent.

---
Cada gràfic ha de tenir **títol clar i descriptiu**, així com una **llegenda si és necessari**. Els títols ajuden els usuaris a entendre què estem mostrant, mentre que les llegendes expliquen el significat dels colors i altres elements. Aquest context és crucial per a una interpretació precisa de les dades.

<div class="grid grid-cols-4">
  <div class="card example hm grid-colspan-2" style="padding-top:5rem;">
    ${resize((width) => 
      Plot.plot({
        width,
        height: width / 2,
        y: {axis: "left"},
        marks: [
          Plot.axisY(remap.ticks(), {color: "red", anchor: "right", y: remap, tickFormat: remap.tickFormat()}),
          Plot.lineY(
            margarine,
            {
              y: d => d,
              x: (d, i) => new Date(i + 2000, 0, 0),
              strokeWidth: 2,
              strokeDasharray: [2,4],
              marker: "dot",
              curve: "monotone-x"
            }
          ),
          Plot.lineY(
            divorces,
            Plot.mapY((D) => D.map(remap),
            {
              y: d => d,
              x: (d, i) => new Date(i + 2000, 0, 0),
              stroke: "red",
              strokeWidth: 2,
              marker: "dot",
              curve: "monotone-x"
            })
          )
        ]
      })
      )
    }

  </div>
  <div class="card example happy grid-colspan-2">
  <h2 class="nopad">Correlació entre el consum per càpita de margarina i la taxa de divorcis a Maine, Estats Units</h2>
  ${resize((width) => 
      Plot.plot({
        width,
        height: width / 2,
        y: {axis: "left", label: "lb de margarina"},
        marks: [
          Plot.axisY(remap.ticks(), {color: "red", anchor: "right", y: remap, tickFormat: remap.tickFormat(), label: "taxa de divorcis"}),
          Plot.lineY(
            margarine,
            {
              y: d => d,
              x: (d, i) => new Date(i + 2000, 0, 0),
              strokeWidth: 2,
              strokeDasharray: [2,4],
              marker: "dot",
              curve: "monotone-x"
            }
          ),
          Plot.lineY(
            divorces,
            Plot.mapY((D) => D.map(remap),
            {
              y: d => d,
              x: (d, i) => new Date(i + 2000, 0, 0),
              stroke: "red",
              strokeWidth: 2,
              marker: "dot",
              curve: "monotone-x"
            })
          )
        ]
      })
      )
    }
    <p class="caption">Font: Tots dos gràfics representen el mateix, una correlació aleatòria deliciosament ximple d'en Tyler Vigen</p>
  </div>
</div>

Els gràfics de dalt són una broma, compte amb les [correlacions espúries](https://www.tylervigen.com/spurious/correlation/5920_per-capita-consumption-of-margarine_correlates-with_the-divorce-rate-in-maine) (mireu el blog d'en Tyler Vigen) i sisplau [no feu servir doble eix](https://blog.datawrapper.de/dualaxis/).

## Elements de disseny
  - Paletes de colors: esquemes de colors, *stroke* més fosc per ajudar a la accessibilitat ...

  <pre data-copy>npm init <span class="win">"</span>@observablehq<span class="win">"</span></pre>

  - Capes visuals: instruccions per crear mapes.
  - Taules cercables: Consells sobre la implementació de taules interactives i cercables per a una exploració detallada de les dades.