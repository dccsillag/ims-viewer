#!/usr/bin/env python3
# vim: fdm=indent
import sys
import argparse
import pandas as pd


def load_table(fpath):
    if fpath.endswith('.csv'):
        return pd.read_csv(fpath)
    else:
        raise ValueError("Unrecognized file extension")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('output', action='store', help="Output file")
    ap.add_argument('inputs', action='store', nargs='+', help="Input files")
    args = ap.parse_args()

    tables = [load_table(x) for x in args.inputs]
    output = pd.concat(tables)

    if args.output.endswith('.csv'):
        output.to_csv(args.output)
    else:
        raise ValueError("Unrecognized file extension")


if __name__ == '__main__':
    sys.exit(main())
