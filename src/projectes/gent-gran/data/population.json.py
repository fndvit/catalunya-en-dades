import pandas as pd
import urllib.request, json
import sys

with urllib.request.urlopen("https://api.idescat.cat/taules/v2/censph/540/19948/com/data") as url:
    data = json.load(url)

# The API endpoint returns a sequential, single array of data.
# To access the required values, the array should be mapped using the indexes provided in the metadata.
dimension = data['dimension']
sizes = data['size']
dimension_year = sizes[1] * sizes[2] * sizes[3]
dimension_community = sizes[2] * sizes[3]
dimension_sex = sizes[3]
index_sex_total = list(dimension['SEX']['category']['label'].keys()).index('TOTAL')
index_age_65 = list(dimension['AGE']['category']['label'].keys()).index('Y_GE065')
index_age_total = list(dimension['AGE']['category']['label'].keys()).index('TOTAL')

data_values = data['value']

year_values = []
community_name_population_over_65 = []
population_over_65 = []
population = []

for year_index, year in enumerate(dimension['YEAR']['category']['label'].items()):
    for community_index, community in enumerate(dimension['COM']['category']['label'].items()):
        if community[0] != 'TOTAL':
            year_values.append(int(year[1]))
            community_name_population_over_65.append(str(community[1]))
            population_over_65.append(data_values[year_index * dimension_year +
                                                  community_index * dimension_community +
                                                  index_sex_total * dimension_sex +
                                                  index_age_65])
            population.append(data_values[year_index * dimension_year +
                                          community_index * dimension_community +
                                          index_sex_total * dimension_sex +
                                          index_age_total])

population_df = pd.DataFrame({'year': year_values,
                              'nom_comarca': community_name_population_over_65,
                              'population_over_65': population_over_65,
                              'population': population})
population_df.to_json(sys.stdout, orient='records')
