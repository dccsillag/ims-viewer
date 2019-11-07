#!/bin/bash

set -o xtrace

# Anonimos
python3 xml_to_pandas.py inputs/Anonimos.xml outputs/final/Anonimos.pickle
python3 xml_to_pandas.py inputs/Anonimos.xml outputs/final/Anonimos.csv -R

# Farkas
python3 xml_to_pandas.py inputs/Farkas.xml outputs/final/Farkas.pickle
python3 xml_to_pandas.py inputs/Farkas.xml outputs/final/Farkas.csv -R

# Ferrez
python3 xml_to_pandas.py inputs/Ferrez.xml outputs/final/Ferrez.pickle
python3 xml_to_pandas.py inputs/Ferrez.xml outputs/final/Ferrez.csv -R

# Maureen
python3 xml_to_pandas.py inputs/Maureen.xml outputs/final/Maureen.pickle
python3 xml_to_pandas.py inputs/Maureen.xml outputs/final/Maureen.csv -R

# Medeiros
python3 xml_to_pandas.py inputs/Medeiros.xml outputs/final/Medeiros.pickle
python3 xml_to_pandas.py inputs/Medeiros.xml outputs/final/Medeiros.csv -R


# Concatenate everything
python3 merge_tables.py webpage/table.csv outputs/final/*.csv
