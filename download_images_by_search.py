#!/usr/bin/env python3
# vim: fdm=indent
import sys
import argparse
import time
import os
import shutil
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, ElementClickInterceptedException, ElementNotInteractableException, StaleElementReferenceException, NoSuchElementException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.common.by import By
from progressbar import ProgressBar


class CursorChangesFromWaiting():
    """ Helper class for waiting until the cursor changes back to normal) """
    def __init__(self, browser):
        self.browser = browser
        self.was_waiting = None

    def __call__(self, ignored):
        """ This will be called every 500ms by Selenium until it returns true (or we time out) """
        cursor = self.browser.find_element_by_tag_name("body").value_of_css_property("cursor")
        if self.was_waiting is None:
            self.was_waiting = cursor == "wait"
            return False
        elif self.was_waiting:
            self.was_waiting = cursor == "wait"
            return cursor != "wait"
        else:
            self.was_waiting = cursor == "wait"
            return False


class CursorNotWaiting():
    """ Helper class for waiting until the cursor is normal) """
    def __init__(self, browser):
        self.browser = browser

    def __call__(self, ignored):
        """ This will be called every 500ms by Selenium until it returns true (or we time out) """
        cursor = self.browser.find_element_by_tag_name("body").value_of_css_property("cursor")
        return cursor != "wait"


def main():
    ap = argparse.ArgumentParser()
    #ap.add_argument("url", action='store', type=str, default='http://acervos.ims.com.br/#/search?page={pagen}', nargs='?', help="URL to access, replacing {pagen} for the page number")
    ap.add_argument("database", action='store', type=str, help="Database for the script to get its file names from")
    ap.add_argument("url", action='store', type=str, default="http://acervos.ims.com.br/#/search?filtersStateId=5", nargs='?', help="URL to access")
    ap.add_argument("-o", "--output-directory", action='store', type=str, default=os.getcwd(), help="Output directory for the downloaded images")
    ap.add_argument("-d", "--diagonal", action='store', type=int, help="Diagonal size for the downloaded images in pixels (they will be resized)")  # Use -d 50
    args = ap.parse_args()

    infile_ext = args.database.split('.')[-1]
    if infile_ext == 'pickle':
        df = pd.read_pickle(args.database)
    elif infile_ext == 'xlsx':
        df = pd.read_excel(args.database)
    elif infile_ext == 'csv':
        df = pd.read_csv(args.database)
    else:
        raise ValueError("Unknown file format: %s" % infile_ext)

    if not os.path.exists(args.output_directory):
        reponse = None
        while reponse not in 'y n'.split():
            response = input("The given output directory does not exist. Create it? [Y/N]  ").lower()
        if response == 'y':
            os.mkdir(args.output_directory)
        else:
            return 0
    elif not os.path.isdir(args.output_directory):
        print("ERROR: The given output directory is not a directory.")
        return 1
    else:
        if len(os.listdir(args.output_directory)) > 0:
            print("The given output directory is not empty. What would you like to do?")
            print("  1      empty it")
            print("  2      continue")
            print("  3      exit")
            response = None
            while response not in '1 2 3'.split():
                response = input("[1/2/3]  ").lower()
            if response == '1':
                shutil.rmtree(args.output_directory)
                os.mkdir(args.output_directory)
            elif response == '3':
                return 0

    browser = webdriver.Chrome()
    # Get the webpage
    browser.get(args.url)
    input("Filter the page for only photographs, then hit <ENTER>.  ")
    # Wait for it to load properly
    try:
        element_present = expected_conditions.presence_of_element_located((By.CLASS_NAME, 'img-asset-thumbnail'))
        WebDriverWait(browser, 20).until(element_present)
    except TimeoutException:
        print("timed out")

    pg = ProgressBar(len(df['file name']))

    for _, row in df.iterrows():
        # Get search input
        searchbar = browser.find_element_by_id('search')
        # Search the file name
        searchbar.clear()
        searchbar.send_keys(row['file name'])
        searchbar.send_keys(Keys.RETURN)

        time.sleep(0.2)

        # Wait for it to load properly
        try:
            done_loading = CursorNotWaiting(browser)
            WebDriverWait(browser, 20).until(done_loading)
            element_present = expected_conditions.presence_of_element_located((By.CLASS_NAME, 'img-asset-thumbnail'))
            WebDriverWait(browser, 20).until(element_present)
            is_clickable = expected_conditions.element_to_be_clickable((By.CLASS_NAME, 'img-asset-thumbnail'))
            WebDriverWait(browser, 20).until(is_clickable)
            #element_visible = expected_conditions.invisibility_of_element_located((By.CLASS_NAME, 'img-asset-thumbnail'))
            #WebDriverWait(browser, 20).until(element_visible)
        except TimeoutException:
            print("\atimed out")

        time.sleep(2)

        # Find all images of interest
        while True:
            try:
                items = browser.find_elements_by_class_name('img-asset-thumbnail')
                if len(items) > 1:
                    print("\n\aWARNING: multiple images were found for entry %s." % row['file name'])
                for item in items:
                    try:
                        item.click()
                    except (ElementClickInterceptedException, ElementNotInteractableException):
                        time.sleep(0.2)
                        continue

                    try:
                        element_present = expected_conditions.presence_of_element_located((By.ID, 'preview-img'))
                        WebDriverWait(browser, 20).until(element_present)
                    except TimeoutException:
                        print("\atimed out")

                    img = browser.find_element_by_id('preview-img')
                    src = img.get_attribute('src')
                    before = os.listdir(args.output_directory)
                    code = os.system(f"wget --content-disposition --trust-server-names --quiet -P {args.output_directory} {src}")
                    if code != 0:
                        print("\afailed to download")
                        continue
                    after = os.listdir(args.output_directory)
                    filename = os.path.join(args.output_directory, (set(after) - set(before)).pop())
                    if args.diagonal is not None:
                        os.system(f"convert -resample {args.diagonal} \"{filename}\" \"{filename}\"")
                    pg.advance()
                break
            except (StaleElementReferenceException, NoSuchElementException):
                time.sleep(0.2)
                continue

    pg.finish()

    return 0


if __name__ == '__main__':
    sys.exit(main())
