import os
import tempfile
from io import BytesIO
from zipfile import ZipFile
from urllib.request import urlopen
import sys
import geopandas as gpd

# URL del fitxer ZIP
catalunya_zip_url = 'https://datacloud.icgc.cat/datacloud/divisions-administratives/shp/divisions-administratives-v2r1-20240705.zip'
file_response_by_request = urlopen(catalunya_zip_url)
zip_file_memory = ZipFile(BytesIO(file_response_by_request.read()))

# Obtenir el directori temporal de Windows
temp_dir = tempfile.gettempdir()

# Filtrar els fitxers necessaris
files_shape_selected = [file_name for file_name in zip_file_memory.namelist() if 'comarques-1000000' in file_name]

# Descomprimir els fitxers al directori temporal
for level_map_file in files_shape_selected:
    with zip_file_memory.open(level_map_file) as file:
        with open(os.path.join(temp_dir, level_map_file), 'wb') as f:
            f.write(file.read())

# Buscar el fitxer .shp correcte
shapefile_path = os.path.join(temp_dir, next(file_name for file_name in files_shape_selected if file_name.endswith('.shp')))

# Llegir el fitxer amb GeoPandas
comarques_df = gpd.read_file(shapefile_path)
sys.stderr.writelines([str(len(comarques_df.geometry))])

# Convertir a CRS estàndard (EPSG 4326)
comarques_df = comarques_df.to_crs(epsg=4326)
sys.stderr.writelines([str(len(comarques_df.geometry))])

# Guardar el fitxer GeoJSON al directori temporal
output_file = os.path.join("./", "comarques_catalunya.json")
comarques_df.to_file(output_file, driver="GeoJSON")

print(f"GeoJSON file saved at: {output_file}")
