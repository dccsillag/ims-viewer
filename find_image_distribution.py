#!/usr/bin/env python3
# vim: fdm=indent cc=100
import sys
import os
import argparse
import pandas as pd
import numpy as np
import sklearn.cluster
import tensorflow as tf


def ccw(a, b, c):
    return (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", action='store', type=str, help="Input table")
    ap.add_argument("output", action='store', type=str, help="Output table")
    ap.add_argument("-d", "--image-directory", action='store', type=str, default=os.getcwd(), help="Image Directory")
    args = ap.parse_args()

    if args.input.endswith('.csv'):
        df = pd.read_csv(args.input)
    elif args.input.endswith('.pickle'):
        df = pd.read_pickle(args.input)
    else:
        raise IOError("Unrecognized file extension for input table")

    def prepare_image(fpath):
        img = tf.keras.preprocessing.image.load_img(fpath, target_size=(224, 224))
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array_expanded_dims = np.expand_dims(img_array, axis=0)
        return tf.keras.applications.mobilenet.preprocess_input(img_array_expanded_dims)

    # Find the feature vectors

    ## Load stuff
    ### Load VGG-16, pretrained on the ImageNet dataset
    original_model = tf.keras.applications.vgg16.VGG16()
    ### Remove the last three layers
    inp = original_model.input
    out = original_model.layers[-4].output
    model = tf.keras.Model(inp, out)

    ## Calculate the similarities
    def find_features(fpath):
        if os.path.exists(fpath):
            ### Prepare the image
            img = prepare_image(fpath)
            ### Pass it through the neural net
            return np.squeeze(model.predict(img))
        return None

    featurevecs = df['file path'].apply(find_features, 'ignore')
    featurevecs = np.stack(featurevecs.values)

    fpath_filter = df['file path'].apply(lambda x: os.path.exists(x), 'ignore')

    # Find the clusters

    print("clustering... ", end='')

    clustering = sklearn.cluster.AffinityPropagation().fit_predict(featurevecs)
    clusters_df = pd.DataFrame({'file name': df.loc[fpath_filter, 'file name'], 'cluster': clustering})
    groups_iter = clusters_df.groupby('cluster')
    distrib = []
    for level in range(min(clustering), max(clustering)+1):
        for _, group in groups_iter:
            try:
                row = group.iloc[level]
            except IndexError:
                continue
            distrib.append((row['file name'], level))
    distrib_df = pd.DataFrame(distrib, columns=['file name', 'distribution weight'])
    df = df.merge(distrib_df, how='left', on='file name')

    print("done")

    if args.output.endswith('.csv'):
        df.to_csv(args.output)
    elif args.output.endswith('.pickle'):
        df.to_pickle(args.output)
    else:
        raise IOError("Unrecognized file extension for output table")


if __name__ == '__main__':
    sys.exit(main())
