#!/usr/bin/env python3
# vim: fdm=indent cc=100
import sys
import os
import math
import argparse
import pandas as pd
from PIL import Image
import numpy as np
from scipy.spatial import Voronoi


def ccw(a, b, c):
    return (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0])


def linedist(p, q, pt):
    """ Minimum distance (aka Orthogonal Distance) between a line and a point

        NOTE: not a line segment, but a line.
        """

    return abs(ccw(p, q, pt)) / \
        math.sqrt((q[1] - p[1])**2 + (q[0] - p[0])**2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", action='store', type=str, help="Input table")
    ap.add_argument("output", action='store', type=str, help="Output table")
    ap.add_argument("-d", "--image-directory", action='store', type=str, default=os.getcwd(), help="Image Directory")
    args = ap.parse_args()

    if args.input.endswith('.csv'):
        og_df = pd.read_csv(args.input)
    elif args.input.endswith('.pickle'):
        og_df = pd.read_pickle(args.input)
    else:
        raise IOError("Unrecognized file extension for input table")

    df = og_df[['similarity x', 'similarity y', 'file name']].dropna()
    df = df[np.isfinite(df['similarity x']) & np.isfinite(df['similarity y'])]

    # Read some stuff
    dims = df['file name'] \
        .apply(lambda fpath: Image.open(os.path.join(args.image_directory, fpath)).size if os.path.exists(os.path.join(args.image_directory, fpath)) else None, 'ignore')
    pts = [tuple(x) for x in df[['similarity x', 'similarity y']].values]

    # Find the Voronoi diagram of the points
    voronoi = Voronoi(pts)

    widths  = []
    heights = []
    for ki, k in enumerate(filter(lambda x: x >= 0, voronoi.point_region)):
        if dims[ki] is not None:
            image_width, image_height = dims[ki]
            site = voronoi.regions[k]

            edges = []
            for i in range(len(site)):
                if site[i] >= 0 and site[(i+1) % len(site)] >= 0:
                    edges.append((voronoi.vertices[site[i]],
                                  voronoi.vertices[site[(i+1) % len(site)]]))

            radius = min(linedist(p0, p1, pts[ki]) for p0, p1 in edges)

            norm = math.sqrt(image_width**2 + image_height**2)
            w    = radius*image_width / norm
            h    = radius*image_height / norm

            widths.append(w)
            heights.append(h)
        else:
            widths.append(None)
            heights.append(None)

    og_df['similarity width'] = widths
    og_df['similarity height'] = heights

    if args.output.endswith('.csv'):
        og_df.to_csv(args.output)
    elif args.output.endswith('.pickle'):
        og_df.to_pickle(args.output)
    else:
        raise IOError("Unrecognized file extension for output table")


if __name__ == '__main__':
    sys.exit(main())
