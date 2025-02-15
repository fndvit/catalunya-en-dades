// URLs dels datasets
const dataUrl = "https://analisi.transparenciacatalunya.cat/resource/8idm-becu.json?$limit=45079";

  try {
    // Obtenir les dades de consum d'energia electrica
    const dataResponse = await fetch(dataUrl);
    if (!dataResponse.ok) throw new Error("Error en la descàrrega de dades");
    const data = await dataResponse.json();


    // Netejar el noms dels municipis i comarques
    const getName = (name) => name.split(',')[0];

    data.forEach(item => {
      item['municipi'] = getName(item['municipi']);
      item['comarca'] = getName(item['comarca']);
    });

    // Funció per corretgir el noms (títol amb la primera lletra en majúscula)
    const correctName = (name) => name.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());


    data.forEach(item => {
      item['municipi'] = correctName(item['municipi']);
      item['comarca'] = correctName(item['comarca']);
      item['provincia'] = correctName(item['provincia']);
      item['descripcio_sector'] = correctName(item['descripcio_sector']);
      // Modificar el nom de "CONSTRUCCIO I OBRES PUBLIQUES"
      if (item['descripcio_sector'] === "Construccio I Obres Publiques") {
        item['descripcio_sector'] = "Construcció i Obres";
      }
      
    });

    // Mostrar el resultat com JSON
    process.stdout.write(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error("Error:", error);
  }

