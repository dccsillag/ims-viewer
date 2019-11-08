#!/usr/bin/env python3
# vim: iskeyword+=_ fdm=indent
import sys
import os
import argparse
import pandas as pd
from PIL import Image


def rects_overlap(l0, s0, l1, s1):
    r0 = (l0[0]+s0[0], l0[1]+s0[1])
    r1 = (l1[0]+s1[0], l1[1]+s1[1])
    return not (r0[0] <= l1[0] or  r1[0] <= l0[0] or  r0[1] <= l1[1] or  r1[1] <= l0[1])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", action='store', type=str, help="Input table")
    ap.add_argument("output", action='store', type=str, help="Output table")
    args = ap.parse_args()

    if args.input.endswith('.csv'):
        df = pd.read_csv(args.input)
    elif args.input.endswith('.pickle'):
        df = pd.read_pickle(args.input)
    else:
        raise IOError("Unrecognized file extension for input table")

    dims = df['file path'].apply(lambda fpath: Image.open(fpath).size if os.path.exists(fpath) else None, 'ignore').dropna()
    size = 100

    rects = zip(zip(df['similarity x'], df['similarity y']), dims)
    while any(map(lambda x: any(map(lambda y: x != y and rects_overlap(*x, *y), rects)), rects)):
        size *= 0.5

    print(f"size = {size}")

    df['similarity size'] = size

    if args.output.endswith('.csv'):
        df.to_csv(args.output)
    elif args.output.endswith('.pickle'):
        df.to_pickle(args.output)
    else:
        raise IOError("Unrecognized file extension for output table")


if __name__ == '__main__':
    sys.exit(main())
