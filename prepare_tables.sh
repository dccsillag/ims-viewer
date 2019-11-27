#!/bin/bash

set -e
set -o xtrace

## Anonimos
#python3 xml_to_pandas.py inputs/Anonimos.xml -f webpage/imgs/ outputs/final/Anonimos.pickle
#python3 xml_to_pandas.py inputs/Anonimos.xml -f webpage/imgs/ outputs/final/Anonimos.csv -R
#
## Farkas
#python3 xml_to_pandas.py inputs/Farkas.xml -f webpage/imgs/ outputs/final/Farkas.pickle
#python3 xml_to_pandas.py inputs/Farkas.xml -f webpage/imgs/ outputs/final/Farkas.csv -R
#
## Ferrez
#python3 xml_to_pandas.py inputs/Ferrez.xml -f webpage/imgs/ outputs/final/Ferrez.pickle
#python3 xml_to_pandas.py inputs/Ferrez.xml -f webpage/imgs/ outputs/final/Ferrez.csv -R
#
## Maureen
#python3 xml_to_pandas.py inputs/Maureen.xml -f webpage/imgs/ outputs/final/Maureen.pickle
#python3 xml_to_pandas.py inputs/Maureen.xml -f webpage/imgs/ outputs/final/Maureen.csv -R
#
## Medeiros
#python3 xml_to_pandas.py inputs/Medeiros.xml -f webpage/imgs/ outputs/final/Medeiros.pickle
#python3 xml_to_pandas.py inputs/Medeiros.xml -f webpage/imgs/ outputs/final/Medeiros.csv -R
#
#
## Concatenate everything
#python3 merge_tables.py webpage/table_og.csv outputs/final/*.csv
#
## Filter images for those that exist
#python3 images_exist.py webpage/table_og.csv webpage/imgs/ webpage/table_og.csv -f

# Find the image sizes for the similarity projection
python3 find_image_scales.py webpage/table_og.csv webpage/table.csv -d webpage/imgs/

# Find the image distribution weights for the distributed view
python3 find_image_distribution.py webpage/table.csv webpage/table.csv -d webpage/imgs/
