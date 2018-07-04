import os

str = ''
for path, subdirs, files in os.walk('mini'):
    for file in files:
        str += file
        str += ','
str = str.replace('.png','')
str = str[0:-1]

with open('flag.csv','w') as f:
    f.write(str)