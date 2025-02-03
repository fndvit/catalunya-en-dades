import pandas as pd
import urllib.request, json
import sys

SERVICES_GENT_GRAN = {'CENTRE_DIA': "Servei de centre de dia per a gent gran de caràcter temporal o permanent",
                      'RESIDENCIA': "Servei de residència assistida per a gent gran de caràcter temporal o permanent",
                      'LLAR': "Servei de llar residència per a gent gran de caràcter temporal o permanent",
                      'TUTELA': "Servei de tutela per a gent gran",
                      'HABITAGE': "Servei d' habitatge tutelat per a gent gran de caràcter temporal o permanent"}

api_endpoint_institution = 'https://analisi.transparenciacatalunya.cat/resource/ivft-vegh.json'

complete_result_api_response = []

for i in range(100):
    with urllib.request.urlopen(f"{api_endpoint_institution}?$offset={i*1000}") as url:
        temporal_result = json.load(url)
        if len(temporal_result) == 0:
            sys.stderr.write(f"Finished at iteration {i+1}: total registers read {len(complete_result_api_response)} from api entities\n")
            break
        else:
            sys.stderr.write(f"Iteration {i+1}: read {len(temporal_result)} registers from api entities\n")
            complete_result_api_response = complete_result_api_response + temporal_result

entities_df = pd.DataFrame(complete_result_api_response)

entities_service_target_df = entities_df[entities_df['tipologia'].isin(list(SERVICES_GENT_GRAN.values()))][['registre', 'nom', 'tipologia', 'inscripcio', 'capacitat', 'adreca', 'municipi', 'comarca', 'qualificacio']]
entities_service_target_df['registre'] = entities_service_target_df['registre'].astype("string")
entities_service_target_df['nom'] = entities_service_target_df['nom'].astype("string")
entities_service_target_df['tipologia'] = entities_service_target_df['tipologia'].astype("string")
entities_service_target_df['inscripcio'] = entities_service_target_df['inscripcio'].astype("string")
entities_service_target_df['capacitat'] = entities_service_target_df['capacitat'].astype(int)
entities_service_target_df['adreca'] = entities_service_target_df['adreca'].astype("string")
entities_service_target_df['municipi'] = entities_service_target_df['municipi'].astype("string")
entities_service_target_df['comarca'] = entities_service_target_df['comarca'].astype("string")
entities_service_target_df['qualificacio'] = entities_service_target_df['qualificacio'].astype("string")

entitats_comarca_df = entities_service_target_df.groupby(['tipologia', 'comarca', 'inscripcio', 'qualificacio'])['capacitat'].sum().reset_index()
entitats_comarca_df['year'] = pd.to_datetime(entitats_comarca_df['inscripcio']).dt.year

grouped_entitats_comarca_qualificacion_df = entitats_comarca_df.groupby(['tipologia', 'comarca', 'year', 'qualificacio'])['capacitat'].sum().reset_index()
grouped_entitats_comarca_qualificacion_df = grouped_entitats_comarca_qualificacion_df.sort_values(by=['comarca', 'tipologia', 'qualificacio', 'year'])
grouped_entitats_comarca_qualificacion_df['cumulative_count'] = grouped_entitats_comarca_qualificacion_df.groupby(['comarca', 'tipologia', 'qualificacio'])['capacitat'].cumsum()

grouped_entitats_comarca_df = entitats_comarca_df.groupby(['tipologia', 'comarca', 'year'])['capacitat'].sum().reset_index()
grouped_entitats_comarca_df = grouped_entitats_comarca_df.sort_values(by=['comarca', 'tipologia', 'year'])
grouped_entitats_comarca_df['cumulative_count'] = grouped_entitats_comarca_df.groupby(['comarca', 'tipologia'])['capacitat'].cumsum()

entities_capacity = {
    'entities_gent_gran': entities_service_target_df.to_dict(orient='records'),
    'entities_comarca_qualificacion_acumulative': grouped_entitats_comarca_qualificacion_df.to_dict(orient='records'),
    'entities_comarca_acumulative': grouped_entitats_comarca_df.to_dict(orient='records'),
}

json.dump(entities_capacity, sys.stdout)