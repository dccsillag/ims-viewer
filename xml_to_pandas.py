#!/usr/bin/env python3
# vim: fdm=indent

import sys
import os
import argparse
from pprint import pprint
from xml.etree import ElementTree
import numpy as np
import pandas as pd
import pickle
import ssl
import certifi
import geopy.geocoders
from geopy.geocoders import Nominatim
import time
from progressbar import ProgressBar

# Setup SSL certificate for Geopy's Geocoders
# reference: https://stackoverflow.com/a/52824840/4803382
ctx = ssl.create_default_context(cafile=certifi.where())
geopy.geocoders.options.default_ssl_context = ctx


STRS = {
    "pt": {
        "file name": "nome do arquivo",
        "place": "local",
        "ambient": "espacialidade",
        "genre": "gênero de imagem",
        "annotations": "anotações",
        "time of image": "temporalidade",
        "day": "dia",
        "month": "mês",
        "year": "ano",
        "title": "título",
        "author": "autoria",
        "process": "processo formador da imagem",
        "time precision": "precisão da temporalidade",
        "image dimensions": "dimensões",
        "formal aspects": "aspectos formais",
        "timing": "temporalidade",
        "format": "formato",
        "width": "largura",
        "height": "altura",
        "country": "país",
        "state": "estado",
        "county": "município",
        "location string": "texto do local",
        "exact location": "localização exata",
        "latitude": "latitude",
        "longitude": "longitude",
    },
    "en": {
        "file name": "file name",
        "place": "place",
        "ambient": "ambient",
        "genre": "genre",
        "annotations": "annotations",
        "time of image": "time of image",
        "day": "day",
        "month": "month",
        "year": "year",
        "title": "title",
        "author": "author",
        "process": "image process",
        "time precision": "time precision",
        "image dimensions": "image dimensions",
        "formal aspects": "formal aspects",
        "timing": "timing",
        "format": "image format",
        "width": "width",
        "height": "height",
        "country": "country",
        "state": "state",
        "county": "county",
        "location string": "location string",
        "exact location": "exact location",
        "latitude": "latitude",
        "longitude": "longitude",
    },
}


def main():
    ap = argparse.ArgumentParser(description="Convert one of the *.xml files we've got to a Pandas dataframe - CSV or pickle.",
                                 formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    ap.add_argument("input", action='store', type=str, help="input file")
    ap.add_argument("output", action='store', type=str, help="output file")
    ap.add_argument("-l", "--language", action='store', type=str, default="en", help="language: pt / en")
    ap.add_argument("-R", "--raw-text", action='store_true', default=False, help="Store lists as a string separated by `--separator`")
    ap.add_argument("-s", "--separator", action='store', type=str, default=";", help="Separator to use for storing lists as strings")
    ap.add_argument("-c", "--show-columns", action='store_true', default=False, help="Show the columns of the original *.xml file")
    ap.add_argument("-d", "--drop-na", action='store_true', default=False, help="Drop rows with N/A fields")
    ap.add_argument("-D", "--delay", action='store', type=float, default=2, help="Delay (in seconds) to sleep in between geolocation queries")
    ap.add_argument("-n", "--n-rows", action='store', type=int, default=None, help="If set, take the given number of rows from the generated table (before finding the latitude/longitude)")
    ap.add_argument("-C", "--cache", action='store', type=str, default=os.path.expanduser("~/.nominatim-cache"), help="Cache for the Nominatim queries")
    ap.add_argument("-i", "--images", action='store', type=str, default=None, help="If set, only keep rows whose image's file names exist in the given directory")
    args = ap.parse_args()

    print("Reading input file")

    with open(args.input) as f:
        tree = ElementTree.parse(f)
    root = tree.getroot()

    if args.show_columns:
        pprint([x[0].text.lower() for x in root[0][0]])

    ns = {'cumulus': 'http://www.canto.com/ns/Export/1.0'}

    table = {
        STRS[args.language]["file name"]:       [],
        STRS[args.language]["title"]:           [],
        STRS[args.language]["author"]:          [],
        STRS[args.language]["time of image"]:   [],
        STRS[args.language]["place"]:           [],
        STRS[args.language]["process"]:         [],
        STRS[args.language]["image dimensions"]:[],
        STRS[args.language]["annotations"]:     [],
        STRS[args.language]['country']:         [],
        STRS[args.language]['state']:           [],
        STRS[args.language]['county']:          [],
    }
    CONVERSIONS = {
        'record name': STRS[args.language]['file name'],
        'local': STRS[args.language]['place'],
        'categories': STRS[args.language]['annotations'],
        'data': STRS[args.language]['time of image'],
        'título': STRS[args.language]['title'],
        'autoria': STRS[args.language]['author'],
        'processo formador da imagem': STRS[args.language]['process'],
        'dimensão': STRS[args.language]['image dimensions'],
        'país': STRS[args.language]['country'],
        'estado': STRS[args.language]['state'],
        'município': STRS[args.language]['county'],
        # (* NOTE: these should be done after the 'Fill the records' loop *)   'width': STRS[args.language]['width'],
        # (* NOTE: these should be done after the 'Fill the records' loop *)   'height': STRS[args.language]['height'],
    }

    # Find the uids
    uids = {}
    for thing in root[0][0]:
        uids[thing.attrib['uid']] = thing[0].text.lower()

    print("Building the pandas DataFrame")

    # Fill the records
    for thing in root[1]:
        added = set()
        for field_value in thing.findall('cumulus:FieldValue', ns):
            try:
                if len(field_value) == 0:
                    value = field_value.text.strip()
                else:
                    value = [x.text.strip().split(':') for x in field_value]

                table[CONVERSIONS[uids[field_value.attrib['uid']]]].append(value)
                added.add(field_value.attrib['uid'])
            except KeyError:
                continue
        for missing in uids.keys() - added:
            try:
                table[CONVERSIONS[uids[missing]]].append(None)
            except KeyError:
                continue

    # Create the actual DataFrame
    df = pd.DataFrame(table)

    # Process some stuff
    ## Make the 'author' column a string
    df[STRS[args.language]['author']] = df[STRS[args.language]['author']].map(lambda x: x[0][0], 'ignore')
    ## Make the 'process' column a string
    df[STRS[args.language]['process']] = df[STRS[args.language]['process']].map(lambda x: x[0][0], 'ignore')
    ## Build the 'time precision' column
    df[STRS[args.language]['time precision']] = df[STRS[args.language]['time of image']].map(lambda x: None if x is None else
        'it' if ' ' not in x else x.split()[1], 'ignore')
    ## Make the 'time of image' column a single date
    df[STRS[args.language]['time of image']] = df[STRS[args.language]['time of image']].map(lambda x: None if x is None else x.split()[0], 'ignore')
    ## Build the 'formal aspects' column
    df[STRS[args.language]['formal aspects']] = df[STRS[args.language]['annotations']].map(lambda x: list(filter(lambda y: 'ASPECTOS FORMAIS DA IMAGEM' in y, x)), 'ignore') \
                                                                                      .dropna().where(lambda x: x.apply(len) > 0)
    ## Extracting some of the formal aspects into other columns:
    def formal_aspect_extract(aspects, goal, na=np.nan):
        """ helper function """
        for aspect in aspects:
            try:
                if aspect[2] == goal:
                    return aspect[3]
                else:
                    continue
            except IndexError:
                continue
        return na
    ### Build the 'timing' column (temporalidade)
    df[STRS[args.language]['timing']] = df[STRS[args.language]['formal aspects']].map(lambda x: formal_aspect_extract(x, 'Temporalidade'), 'ignore')
    ### Build the 'format' column (formato)
    df[STRS[args.language]['format']] = df[STRS[args.language]['formal aspects']].map(lambda x: formal_aspect_extract(x, 'Formato da Imagem'), 'ignore')
    ### Build the 'ambient' column (espacialidade)
    df[STRS[args.language]['ambient']] = df[STRS[args.language]['formal aspects']].map(lambda x: formal_aspect_extract(x, 'Espacialidade'), 'ignore')
    ### Build the 'genre' column (gênero da imagem)
    df[STRS[args.language]['genre']] = df[STRS[args.language]['formal aspects']].map(lambda x: formal_aspect_extract(x, 'Gênero da Imagem'), 'ignore')
    ### Build the 'day', 'month' and 'year' column
    def get_date_part(datestr, part):
        if datestr == 's.d.':
            return 0
        parts = list(map(int, datestr.split("/")))
        if part < len(parts):
            return parts[part]
        else:
            return 0
    # In the input, date is given by Y/M/D.
    df[STRS[args.language]['day']]   = df[STRS[args.language]['time of image']].map(lambda x: get_date_part(x, 2), 'ignore').fillna(0)
    df[STRS[args.language]['month']] = df[STRS[args.language]['time of image']].map(lambda x: get_date_part(x, 1), 'ignore').fillna(0)
    df[STRS[args.language]['year']]  = df[STRS[args.language]['time of image']].map(lambda x: get_date_part(x, 0), 'ignore').fillna(0)
    ## Find out more stuff
    ### Find the latitude and longitude of each image using geopy
    geolocator = Nominatim()
    df[STRS[args.language]['country']] = df[STRS[args.language]['country']].map(lambda x: x[0][0], 'ignore')
    df[STRS[args.language]['state']] = df[STRS[args.language]['state']].map(lambda x: x[0][0], 'ignore')
    df[STRS[args.language]['county']] = df[STRS[args.language]['county']].map(lambda x: x[0][0], 'ignore')
    df[STRS[args.language]['location string']]  = df[STRS[args.language]['place']].fillna("") + ", "
    df[STRS[args.language]['location string']] += df[STRS[args.language]['county']].fillna("") + ", "
    df[STRS[args.language]['location string']] += df[STRS[args.language]['state']].fillna("") + ", "
    df[STRS[args.language]['location string']] += df[STRS[args.language]['country']].fillna("")
    df[STRS[args.language]['location string']] = df[STRS[args.language]['location string']].map(lambda x: x.replace(", , ", ", "))
    df[STRS[args.language]['location string']] = df[STRS[args.language]['location string']].map(lambda x: x.replace(", , ", ", "))
    df[STRS[args.language]['location string']] = df[STRS[args.language]['location string']].map(lambda x: x[2:] if x.startswith(", ") else x)
    df[STRS[args.language]['location string']] = df[STRS[args.language]['location string']].map(lambda x: x[:-2] if x.endswith(", ") else x)
    df[STRS[args.language]['location string']].apply(lambda x: None if x == "" else x, 'ignore')
    df[STRS[args.language]['exact location']] = True
    if args.n_rows is not None:
        df = df.take(range(args.n_rows))
    print("Finding geolocations...")
    if not os.path.exists(args.cache):
        print("Creating %s geolocation cache file" % args.cache)
        with open(args.cache, 'wb') as cachefile:
            pickle.dump({}, cachefile)
    pg = ProgressBar(len(df.index))
    with open(args.cache, 'r+b') as cachefile:
        def geolocate(location_string):
            def is_invalid(loc):
                if location_string != "" and (loc is None or pd.isna(loc.latitude) or pd.isna(loc.longitude)):
                    df.loc[df[STRS[args.language]['location string']] == location_string, STRS[args.language]['exact location']] = False
                    return True
                else:
                    return False

            cachefile.seek(0)
            cache = pickle.load(cachefile)  # A dictionary (keys = queries, and values = geocoded location)
            if location_string in cache:
                location = cache[location_string]
                if is_invalid(location):
                    time.sleep(args.delay)
                    return geolocate(", ".join(location_string.split(", ")[1:]))
                else:
                    pg.advance(measure=False)
                    return cache[location_string]
            location = geolocator.geocode(location_string, timeout=10)
            cache[location_string] = location
            time.sleep(args.delay)
            cachefile.seek(0)
            pickle.dump(cache, cachefile)
            if is_invalid(location):
                return geolocate(", ".join(location_string.split(", ")[1:]))
            else:
                pg.advance()
                return location
        geolocators = df[STRS[args.language]['location string']].apply(geolocate, 'ignore')
        pg.finish()
    df[STRS[args.language]['latitude']] = geolocators.map(lambda x: x.latitude, 'ignore')
    df[STRS[args.language]['longitude']] = geolocators.map(lambda x: x.longitude, 'ignore')
    ## If `--raw-text`, then make the 'annotations' column raw text
    if args.raw_text:
        df[STRS[args.language]['annotations']] = df[STRS[args.language]['annotations']].map(lambda x: args.separator.join(':'.join(y) for y in x), 'ignore')
    ## If `--raw-text`, then make the 'formal aspects' column raw text
    if args.raw_text:
        df[STRS[args.language]['formal aspects']] = df[STRS[args.language]['formal aspects']].map(lambda x: args.separator.join(':'.join(y) for y in x), 'ignore')

    # If `--drop-na`, drop N/A fields.
    if args.drop_na:
        df.dropna(inplace=True)
    if args.images is not None:
        print(len(df.index))
        df = df[df['file name'].map(lambda x: x in os.listdir(args.images))]
        print(len(df.index))
        #df = df[df['file name'].map(lambda x: not pd.isna(x) and x in os.listdir(args.images))]

    # Save it
    output_ext = args.output.split(".")[-1]
    if output_ext == "csv":
        print("Exporting CSV")
        df.to_csv(args.output)
    elif output_ext == "pkl" or output_ext == "pickle":
        print("Exporting Pickle")
        df.to_pickle(args.output)
    elif output_ext == "xlsx":
        print("Exporting to Excel")
        df.to_excel(args.output)
    else:
        print(f"Unknown output format: {output_ext}", file=sys.stderr)
        return 1

    # Finish the job
    print( "Successful conversion!")
    print(f"{args.input} → {args.output}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
