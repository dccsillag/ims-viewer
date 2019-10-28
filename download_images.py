#!/usr/bin/env python3
# vim: fdm=indent
import sys
import argparse
import time
import os
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.common.by import By


PROGRESSBAR_WIDTH = 80


class ProgressBar:
    def __init__(self, total, doprint):
        self.total = total
        self.current = 0
        self.logtext = ""
        self.printed = doprint
        if doprint:
            self.print()

    def print(self):
        print('\r  {percent}% ▐{pg_filled}{pg_empty}▌ '.format(
            percent   = '%3d' % round(100*self.current/self.total),
            pg_filled = round(PROGRESSBAR_WIDTH*self.current/self.total) * '█',
            pg_empty  = round(PROGRESSBAR_WIDTH*(self.total-self.current)/self.total) * ' ',
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

    def advance(self, n=1):
        self.current += n
        self.print()
        self.log("")

    def finish(self):
        self.current = self.total
        self.log("")
        self.print()
        print()


def main():
    ap = argparse.ArgumentParser()
    #ap.add_argument("url", action='store', type=str, default='http://acervos.ims.com.br/#/search?page={pagen}', nargs='?', help="URL to access, replacing {pagen} for the page number")
    ap.add_argument("url", action='store', type=str, default='http://acervos.ims.com.br/#/search?filtersStateId=5&page={pagen}', nargs='?', help="URL to access, replacing {pagen} for the page number")
    ap.add_argument("-n", action='store', type=int, default=1772, help="Number of pages to process")
    ap.add_argument("-o", "--output-directory", action='store', type=str, default=os.getcwd(), help="Output directory for the downloaded images")
    ap.add_argument("-d", "--diagonal", action='store', type=int, help="Diagonal size for the downloaded images in pixels (they will be resized)")  # Use -d 50
    args = ap.parse_args()

    #cookies = {'JSESSIONID': "1954E6E3E8789D67206EEB135E9B436C"}
    print(dir(webdriver))
    browser = webdriver.Chrome()
    #browser.add_cookie({'name': 'JSESSIONID', 'value': "0338F57111F2F04E5D7747D7B665802A", 'domain': "201.73.128.131"})
    is_first = True

    pg = ProgressBar(20*args.n, False)  # 20 images per page
    for pagen in range(1, args.n+1):
        pg.log("GET")
        # Get the webpage
        browser.get(args.url.format(pagen=pagen))
        if is_first:
            input("Hit enter once it's properly filtered. ")
            is_first = False

        # Wait for it to load properly
        pg.log("load page")
        try:
            element_present = expected_conditions.presence_of_element_located((By.CLASS_NAME, 'img-asset-thumbnail'))
            WebDriverWait(browser, 20).until(element_present)
        except TimeoutException:
            print("timed out")

        # Find all images of interest
        pg.log("get images")
        items = browser.find_elements_by_class_name('img-asset-thumbnail')
        for item in items:
            pg.log("click")
            item.click()
            pg.log("get preview image")
            try:
                element_present = expected_conditions.presence_of_element_located((By.ID, 'preview-img'))
                WebDriverWait(browser, 20).until(element_present)
            except TimeoutException:
                print("timed out")
            img = browser.find_element_by_id('preview-img')
            src = img.get_attribute('src')
            before = os.listdir(args.output_directory)
            pg.log("download image")
            os.system(f"wget --content-disposition --trust-server-names --quiet -P {args.output_directory} {src}")
            after = os.listdir(args.output_directory)
            filename = os.path.join(args.output_directory, (set(after) - set(before)).pop())
            if args.diagonal is not None:
                pg.log("resize image")
                os.system(f"convert -resample {args.diagonal} \"{filename}\" \"{filename}\"")
            pg.advance()

        # Before proceeding, keep the aquired cookies
        for cookie in browser.get_cookies():
            browser.add_cookie(cookie)

        time.sleep(1)

    pg.finish()

    return 0


if __name__ == '__main__':
    sys.exit(main())
