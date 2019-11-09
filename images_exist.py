#!/usr/bin/env python3
# vim: fdm=indent
import sys
import os
import argparse
import pandas as pd


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", action='store', type=str, help="Input table")
    ap.add_argument("images", action='store', type=str, help="Image directory")
    ap.add_argument("output", action='store', type=str, help="Output table")
    ap.add_argument("-f", "--filter", action='store_true', help="Whether to filter the resulting table (default=False)")
    args = ap.parse_args()

    if args.input.endswith('.csv'):
        df = pd.read_csv(args.input)
    elif args.input.endswith('.pickle'):
        df = pd.read_pickle(args.input)
    else:
        raise IOError("Unrecognized file extension for input table")

    if args.filter:
        df = df[df['file name'].map(lambda fname: os.path.exists(os.path.join(args.images, fname)), 'ignore')]
    else:
        df['file exists'] = df['file name'].map(lambda fname: os.path.exists(os.path.join(args.images, fname)), 'ignore')

    if args.output.endswith('.csv'):
        df.to_csv(args.output)
    elif args.output.endswith('.pickle'):
        df.to_pickle(args.output)
    else:
        raise IOError("Unrecognized file extension for output table")


if __name__ == '__main__':
    sys.exit(main())
