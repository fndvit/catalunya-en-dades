const response = await fetch("https://analisi.transparenciacatalunya.cat/resource/2gws-ubmt.json");
if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
const data = await response.json();

const comarquesShortNames = ({
    "ALT CAMP, L'" : "Alt Camp",
    "ALT EMPORDÀ, L'" : "Alt Empordà",
    "ALT PENEDÈS, L'" : "Alt Penedès",
    "ALT URGELL, L'" : "Alt Urgell",
    "ALTA RIBAGORÇA, L'" : "Alta Ribagorça",
    "ANOIA, L'" : "Anoia",
    "BAGES, EL" : "Bages",
    "BAIX CAMP, EL" : "Baix Camp",
    "BAIX EBRE, EL" : "Baix Ebre",
    "BAIX EMPORDÀ, EL" : "Baix Empordà",
    "BAIX LLOBREGAT, EL" : "Baix Llobregat",
    "BAIX PENEDÈS, EL" : "Baix Penedès",
    "BARCELONÈS, EL" : "Barcelonès",
    "BERGUEDÀ, EL" : "Berguedà",
    "CERDANYA, LA" : "Cerdanya",
    "CONCA DE BARBERÀ, LA" : "Conca de Barberà",
    "GARRAF, EL" : "Garraf",
    "GARRIGUES, LES" : "Garrigues",
    "GARROTXA, LA" : "Garrotxa",
    "GIRONÈS, EL" : "Gironès",
    "LLUÇANÈS, EL" : "Lluçanès",
    "MARESME, EL" : "Maresme",
    "Moianès" : "Moianès",
    "MONTSIÀ, EL" : "Montsià",
    "NOGUERA, LA" : "Noguera",
    "OSONA" : "Osona",
    "PALLARS JUSSÀ, EL" : "Pallars Jussà",
    "PALLARS SOBIRÀ, EL" : "Pallars Sobirà",
    "PLA D'URGELL, EL" : "Pla d'Urgell",
    "PLA DE L'ESTANY, EL" : "Pla de l'Estany",
    "PRIORAT, EL" : "Priorat",
    "RIBERA D'EBRE, LA" : "Ribera d'Ebre",
    "RIPOLLÈS, EL" : "Ripollès",
    "SEGARRA, LA" : "Segarra",
    "SEGRIÀ, EL" : "Segrià",
    "SELVA, LA" : "Selva",
    "SOLSONÈS, EL" : "Solsonès",
    "TARRAGONÈS, EL" : "Tarragonès",
    "TERRA ALTA" : "Terra Alta",
    "URGELL, L'" : "Urgell",
    "VAL D'ARAN, LA" : "Val d'Aran",
    "VALLÈS OCCIDENTAL, EL" : "Vallès Occidental",
    "VALLÈS ORIENTAL, EL" : "Vallès Oriental"
});

const historic = data.map((d) => {
    const any = parseInt(d["any"]);
    const codiComarca = parseInt(d["codi_comarca"]);
    const comarca = comarquesShortNames[d["comarca"]];
    const poblacio = parseInt(d["poblaci"]);
    const consum_domestic_per_capita = parseInt(d["consum_dom_stic_per_c_pita"]);
    const domestic_xarxa = parseInt(d["dom_stic_xarxa"]);
    const activitats_econòmiques_i_fonts_propies = parseInt(d["activitats_econ_miques_i"]);
    const total = parseInt(d["total"]);
    return { 
        "Any": any,
        "Codi comarca": codiComarca, 
        "Comarca": comarca, 
        "Població": poblacio, 
        "Consum domèstic per càpita": consum_domestic_per_capita, 
        "Domèstic xarxa": domestic_xarxa, 
        "Activitats econòmiques i fonts pròpies": activitats_econòmiques_i_fonts_propies, 
        "Total": total 
    };});

process.stdout.write(JSON.stringify(historic));
