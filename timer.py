import time
import datetime

sec_ctr = 0
min_ctr = 0
hour_ctr = 0
while True:
    time.sleep(1 / 100)
    sec_ctr += 1
    if sec_ctr == 60:
        sec_ctr = 0
        min_ctr += 1
        if min_ctr == 60:
            min_ctr = 0
            hour_ctr += 1
            if hour_ctr == 24:
                hour_ctr = 0
    print(hour_ctr, ':', min_ctr, ':', sec_ctr)
