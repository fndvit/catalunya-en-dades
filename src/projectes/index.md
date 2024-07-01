---
title: Coming soon
toc: true
---

<style>
  h2 {
    margin-top:.5rem;
    margin-bottom:.5rem;
    font-size: 1.1rem!important;
  }

  h2 a {
    color:var(--theme-foreground)!important;
    text-decoration: underline!important;
  }
  .label {
    padding: .2rem .4rem;
    border-radius: .6rem;
    color: var(--white);
    font-size: .75rem;
    font-weight:600;
  }
  .small-label {
    padding-left: .3rem;
    padding-right: .3rem;
  }
  .first {
    padding-left: 0;
  }
  .wip {
    background-color: var(--red);
  }
  .done {
    background-color: var(--blue);
  }
  .wip::after {
    content: 'Work in progress';
  }
  .done::after {
    content: 'Published';
  }
</style>

# El que estem treballant ...
A sota tens la llista de propostes obertes en les quals ja n'hi ha algú treballant. Fes-hi una ullada abans de proposar un nou panell de dades. Si el projecte en el qual volies treballar ja hi és, pots contactar amb qui ho estigui fent per col·laborar, o bé pots crear una versió alternativa; la competència saludable i les solucions alternatives seràn sempre benvingudes.

```js
const response = await fetch('https://api.github.com/repos/fndvit/catalunya-en-dades/issues?state=all');
if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
const json = await response.json();

const getProjectName = (s) => {
    const regex = /\{([^}]+)\}/;
    const match = s.match(regex);
    if (match) {
        const id = match[1];
        const title = s.replace(regex, id);
        return { title, id };
    } else {
        return { title: s, id: null };
    }
}
```

```js
const issues = html`
  <div class="grid grid-cols-4">
  ${json
  .filter(d=> d.labels.map(d => d.name).includes("proposta"))
  .map(d=> {
    const state = d.state === "open" ? "wip" : "done"
    const project = getProjectName(d.title);
    if (state === "done") {
      return html.fragment`
      <div class="card grid-colspan-1">
        <span class="label ${state}"></span>
        <h2><a href='${project.id}/'>${project.title}</a></h2>
        <a class="small-label first" href='${d.html_url}'>Issue on GitHub</a>|
        <a class="small-label" href='https://github.com/fndvit/catalunya-en-dades/tree/${project.id}'>Branch</a>
      </div>`
    }
    else {
     return html.fragment`
      <div class="card grid-colspan-1">
        <span class="label ${state}"></span>
        <h2>${project.title}</h2>
        <a class="small-label first" href='${d.html_url}'>Issue on GitHub</a> |
        <a class="small-label" href='https://github.com/fndvit/catalunya-en-dades/tree/${project.id}'>Branch</a>
      </div>`
    }
      
  })}
  </div>`
```

<div>
${issues}
</div>
