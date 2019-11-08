#!/bin/bash

set -e
set -o xtrace

# Anonimos
python3 xml_to_pandas.py inputs/Anonimos.xml -f webpage/imgs/ outputs/final/Anonimos.pickle
python3 xml_to_pandas.py inputs/Anonimos.xml -f webpage/imgs/ outputs/final/Anonimos.csv -R

# Farkas
python3 xml_to_pandas.py inputs/Farkas.xml -f webpage/imgs/ outputs/final/Farkas.pickle
python3 xml_to_pandas.py inputs/Farkas.xml -f webpage/imgs/ outputs/final/Farkas.csv -R

# Ferrez
python3 xml_to_pandas.py inputs/Ferrez.xml -f webpage/imgs/ outputs/final/Ferrez.pickle
python3 xml_to_pandas.py inputs/Ferrez.xml -f webpage/imgs/ outputs/final/Ferrez.csv -R

# Maureen
python3 xml_to_pandas.py inputs/Maureen.xml -f webpage/imgs/ outputs/final/Maureen.pickle
python3 xml_to_pandas.py inputs/Maureen.xml -f webpage/imgs/ outputs/final/Maureen.csv -R

# Medeiros
python3 xml_to_pandas.py inputs/Medeiros.xml -f webpage/imgs/ outputs/final/Medeiros.pickle
python3 xml_to_pandas.py inputs/Medeiros.xml -f webpage/imgs/ outputs/final/Medeiros.csv -R


# Concatenate everything
python3 merge_tables.py webpage/table.csv outputs/final/*.csv

# Find the image sizes for the similarity projection
python3 find_image_scales.py webpage/table.csv outputs/final/*.csv
