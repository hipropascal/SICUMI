import time
import math
import random
import pyproj
import threading
from mpl_toolkits.basemap import Basemap
import matplotlib.pyplot as plt


class Ship:
    route = []
    speed = 5
    coor = []
    timespeed = 1  # times
    d_seg = []
    d_ac_seg = []
    d_progress = 0
    c_seg = 0
    min_speed = 5
    max_speed = 7
    min_update = 1.  # nautical mile
    max_update = 2.  # nautical mile
    timestamp = 0

    def __init__(self, route):
        self.route = route
        self._dist_seg()
        t = threading.Thread(target=self.timer)
        t.daemon = True
        t.start()

    def simul(self, emit):
        while True:
            rep = self.move(0.1)
            if rep['status'] == 'idle':
                break
            emit('test', rep, broadcast=True)

    def move(self, distance):
        if (self.d_progress + distance) > self.d_ac_seg[-1]:
            distance = self.d_ac_seg[-1] - self.d_progress
        if self.d_progress == self.d_ac_seg[-1]:
            return {'status': 'idle', 'speed': 0, 'position': [0, 0]}
        speed = self._rand_speed(self.speed)  # Generate increase max 1 knot or decrease max1 knot
        delay_report = self._time_needed(distance, speed)
        # time.sleep(delay_report * 360 / self.timespeed)
        time.sleep(0.5)
        print(delay_report * 360 / self.timespeed)
        self.d_progress = self.d_progress + distance
        position = self._distance_to_coor(self.d_progress)
        dirc = self._get_heading(self.route[self.c_seg], position)
        rep = {'status': 'moving', 'speed': speed, 'position': position, 'direction': dirc, 'timestamp': self.timestamp}
        return rep

    def _dist_seg(self):
        dis_accum = 0
        for i, point in enumerate(self.route):
            if i < len(self.route) - 1:
                distance = self._get_dist(point, self.route[i + 1])
                dis_accum += distance
                self.d_seg.append(distance)
                self.d_ac_seg.append(dis_accum)

    def _which_seg(self, d_acq):
        for i, d_ac in enumerate(self.d_ac_seg):
            if d_acq <= d_ac:
                self.c_seg = i
                return i

    def _distance_to_coor(self, d_acq):
        seg_idx = self._which_seg(d_acq)
        b = self.route[seg_idx]
        a = self.route[seg_idx + 1]
        distance = self._get_dist(a, b)
        in_ab_d_acq = d_acq - self.d_ac_seg[seg_idx]
        height = a[0] - b[0]
        width = a[1] - b[1]
        ratio_d = in_ab_d_acq / distance
        lat = a[0] + (height * ratio_d)
        lon = a[1] + (width * ratio_d)
        return [lat, lon]

    def _get_heading(self, point_a, point_b):
        lat1 = math.radians(point_a[0])
        lat2 = math.radians(point_b[0])
        diff_long = math.radians(point_b[1] - point_a[1])
        x = math.sin(diff_long) * math.cos(lat2)
        y = math.cos(lat1) * math.sin(lat2) - (math.sin(lat1)
                                               * math.cos(lat2) * math.cos(diff_long))
        initial_bearing = math.atan2(x, y)
        initial_bearing = math.degrees(initial_bearing)
        compass_bearing = (initial_bearing + 360) % 360
        return compass_bearing

    @staticmethod
    def _get_dist(pos1, pos2):
        r = 3440  # radius in nmi
        lat1 = math.radians(pos1[0])
        lon1 = math.radians(pos1[1])
        lat2 = math.radians(pos2[0])
        lon2 = math.radians(pos2[1])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = r * c
        return distance

    @staticmethod
    def _rand_speed(speed):
        new_speed = 10
        if speed >= 15:
            new_speed = speed + (-1) * random.random()
        if speed >= 14:
            new_speed = speed + -1 + (1.5 * random.random())
        if speed <= 7:
            new_speed = speed + 0.5 + (0.5 * random.random())
        if speed <= 6:
            new_speed = speed + random.random()
        return new_speed

    def _time_needed(self, distance, speed):
        return distance / speed

    def timer(self):
        sec_ctr = 0
        min_ctr = 0
        hour_ctr = 0
        while True:
            time.sleep(1 / self.timespeed)
            sec_ctr += 1
            if sec_ctr == 60:
                sec_ctr = 0
                min_ctr += 1
                if min_ctr == 60:
                    min_ctr = 0
                    hour_ctr += 1
                    if hour_ctr == 24:
                        hour_ctr = 0
            self.timestamp = [hour_ctr, min_ctr, sec_ctr]


surabaya_makasar = [
    [-7.19636, 112.73352],
    [-7.19351, 112.73792],
    [-7.18269, 112.74393],
    [-7.17903, 112.75319],
    [-7.17699, 112.76049],
    [-7.17541, 112.78298],
    [-7.17452, 112.82684],
    [-7.17895, 112.86374],
    [-7.20416, 112.93653],
    [-7.22970, 113.01343],
    [-7.25150, 113.10270],
    [-7.26649, 113.19230],
    [-7.27466, 113.29873],
    [-7.28624, 113.41375],
    [-7.30054, 113.61287],
    [-7.32336, 114.05865],
    [-7.31757, 114.37588],
    [-7.28266, 114.63543],
    [-7.23771, 114.77997],
    [-7.19717, 114.86100],
    [-7.13927, 114.92486],
    [-6.66134, 115.27870],
    [-6.54128, 115.46067],
    [-5.42518, 117.99724],
    [-5.20075, 118.50074],
    [-5.13916, 118.73681],
    [-5.11317, 118.86251],
    [-5.10154, 118.93860],
    [-5.08376, 119.04743],
    [-5.08068, 119.22905],
    [-5.09797, 119.36477],
    [-5.11267, 119.40768],
]

surabaya_balikpapan = [
    [-7.19662, 112.73243],
    [-7.17868, 112.70716],
    [-7.15313, 112.67866],
    [-7.10680, 112.67008],
    [-7.03389, 112.66321],
    [-6.92416, 112.67935],
    [-6.82851, 112.68896],
    [-6.37514, 112.89495],
    [-5.66497, 113.42230],
    [-4.95393, 114.20233],
    [-4.52753, 115.01472],
    [-4.40704, 115.92658],
    [-3.78242, 117.05817],
    [-2.59606, 117.28804],
    [-1.97583, 117.12324],
    [-1.34953, 116.82885],
    [-1.28466, 116.79898],
    [-1.27385, 116.80500]
]

if __name__ == '__main__':
    surabaya_makasar = reversed(surabaya_makasar)
    bmkgship = Ship(surabaya_makasar)
    lats = []
    lons = []
    infos = []
    while True:
        report = bmkgship.move(1 + random.random())
        if report['status'] == 'idle':
            # print('Plotting')
            m = Basemap(projection='mill',
                        urcrnrlat=-3.287360,
                        urcrnrlon=119.950155,
                        llcrnrlat=-8.267519,
                        llcrnrlon=110.776460,
                        resolution='l')
            x, y = m(lons, lats)
            m.drawmapboundary(fill_color='#99ffff')
            m.fillcontinents(color='#cc9966', lake_color='#99ffff')
            m.scatter(x, y, 3, marker='o', color='k')
            plt.show()
            break
        lats.append(report['position'][0])
        lons.append(report['position'][1])
