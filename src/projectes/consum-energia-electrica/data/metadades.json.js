// URLs dels datasets
const metadataUrl = "https://analisi.transparenciacatalunya.cat/api/views/8idm-becu.json";

  try {
    // Obtenir les metadades
    const metadataResponse = await fetch(metadataUrl);
    if (!metadataResponse.ok) throw new Error("Error en la descàrrega de metadades");
    const metadata = await metadataResponse.json();

    // Extreure l'última data d'actualització
    const lastUpdatedTimestamp = metadata.rowsUpdatedAt;
    const lastUpdated = lastUpdatedTimestamp 
      ? new Date(lastUpdatedTimestamp * 1000).toLocaleDateString("ca-ES", {
          day: '2-digit', month: 'long', year: 'numeric'
        })
      : "Fecha no disponible";

    // Informació clau de les metadades
    const metadataInfo = {
      "last_updated_data": lastUpdated,
      "attribution": metadata.attribution || "No disponible",
      "view_count": metadata.viewCount || "No disponible",
      "download_count": metadata.downloadCount || "No disponible",
      "license": metadata.attributionLink || "No disponible"
    };

    // Mostrar el resultat como JSON
    process.stdout.write(JSON.stringify(metadataInfo, null, 2));

  } catch (error) {
    console.error("Error:", error);
  }
