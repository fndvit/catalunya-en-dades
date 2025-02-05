from io import BytesIO
from zipfile import ZipFile
from urllib.request import urlopen
import sys
import geopandas as gpd

catalunya_zip_url = 'https://datacloud.icgc.cat/datacloud/divisions-administratives/shp/divisions-administratives-v2r1-20240705.zip'
file_response_by_request = urlopen(catalunya_zip_url)
zip_file_memory = ZipFile(BytesIO(file_response_by_request.read()))

# The ZIP file contains multiple shapefiles at different levels or scales. A scale map of 1:1,000,000 is sufficient.
files_shape_selected = [file_name for file_name in zip_file_memory.namelist() if 'comarques-1000000' in file_name]
for level_map_file in files_shape_selected:
    with zip_file_memory.open(level_map_file) as file:
        with open(f'/tmp/{level_map_file}', 'wb') as f:
            f.write(file.read())

comarques_df = gpd.read_file(
    f'/tmp/{next(file_name for file_name in files_shape_selected if file_name.endswith('.shp'))}')
sys.stderr.writelines([str(len(comarques_df.geometry))])

# Change to CRS 4326 - d3 standard
comarques_df = comarques_df.to_crs(epsg=4326)
sys.stderr.writelines([str(len(comarques_df.geometry))])
print(comarques_df.to_json())
