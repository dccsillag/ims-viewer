# vim: fdm=indent
import os
import datetime


class ProgressBar:
    progressbar_width = 60

    def __init__(self, total, doprint=True):
        self.total = total
        self.current = 0
        self.logtext = ""
        self.printed = doprint
        self.measurements = []
        self.lasttime = datetime.datetime.now()
        if doprint:
            self.print()

    def print(self):
        rows, columns = os.popen('stty size', 'r').read().split()
        if int(columns) - 50 < self.progressbar_width:
            os.system('clear')
        self.progressbar_width = int(columns) - 50

        if len(self.measurements) < 5:
            print('\r  {i:{pad}d}/{n} ▐{pg_filled}{pg_empty}▌ {percent}% '.format(
                i         = self.current,
                pad       = len(repr(self.total)),
                n         = self.total,
                percent   = '%3d' % round(100*self.current/self.total),
                pg_filled = round(self.progressbar_width*self.current/self.total) * '█',
                pg_empty  = round(self.progressbar_width*(self.total-self.current)/self.total) * ' ',
                ), end='')
        else:
            print('\r  {i:{pad}d}/{n} ▐{pg_filled}{pg_empty}▌ {percent}%    ETA: {eta} '.format(
                i         = self.current,
                pad       = len(repr(self.total)),
                n         = self.total,
                percent   = '%3d' % round(100*self.current/self.total),
                pg_filled = round(self.progressbar_width*self.current/self.total) * '█',
                pg_empty  = round(self.progressbar_width*(self.total-self.current)/self.total) * ' ',
                eta       = (self.total - self.current)*(sum(self.measurements, datetime.timedelta(0)) / len(self.measurements)),
                ), end='')
        self.printed = True

    def log(self, text):
        if not self.printed:
            return
        print('\b'*len(self.logtext), end='')
        print(' '*len(self.logtext), end='')
        print('\b'*len(self.logtext), end='')
        print(text, end='')
        self.logtext = text

    def advance(self, n=1, measure=True):
        self.current += n
        self.print()
        self.log("")

        if measure:
            self.measurements.append(datetime.datetime.now() - self.lasttime)
        self.lasttime = datetime.datetime.now()

    def finish(self):
        self.current = self.total
        self.log("")
        self.print()
        print()
