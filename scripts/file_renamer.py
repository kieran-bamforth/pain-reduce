import os
import sys
import re
import pdb
from datetime import datetime

filename_regex = re.compile('^\d{2}:\d{2}:\d{4}.pdf$')
for filename in os.listdir(sys.argv[1]):
    if filename_regex.match(filename):
        date = datetime.strptime(filename, '%d:%m:%Y.pdf')
        os.rename(sys.argv[1] + '/' + filename, sys.argv[1] + '/' + date.strftime('%Y-%m-%d.pdf'))
