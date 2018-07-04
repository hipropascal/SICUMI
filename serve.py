import os
import json
import time
import math
import datetime
import threading
from flask_cors import CORS
from urllib import request
from flask_socketio import SocketIO
from netCDF4 import Dataset, num2date
from flask import Flask, render_template, jsonify, send_file, make_response
from src.test import ship_ais
from src.misc import logger
from src.controller import ctl_wrf, ctl_inawave, ctl_inaflow

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
dir = os.path.dirname(os.path.realpath(__file__))
apikey = 'AIzaSyDlSvUq8WK9GGXaj4OT9XAxEvPclrKqUIU'
time_ctr = 0


@socketio.on('test')
def handle_my_custom_namespace_event(datstr):
    print('received json: ' + str(datstr))


@app.route('/')
def root():
    return render_template('index.html')


@app.route('/raster/weather/wrf_<type>_<hour>.png')
def serve_wrf(type, hour):
    buffer = dir + '/tmp/wrf_{}_{}.png'.format(type, hour)
    if os.path.isfile(buffer):
        return send_file(buffer, mimetype='image/png')
    image = ctl_wrf.get_raster(type, wrf, int(hour))
    image.save(buffer, format="PNG")
    return send_file(buffer, mimetype='image/png')


@app.route('/raster/weather/hour')
def get_data_hour():
    wrf_units = wrf.variables['time'].units
    wrf_time = num2date(wrf.variables['time'][:], wrf_units, 'standard').tolist()
    return jsonify({"wrf": wrf_time})


@app.route('/raster/weather/point_<hour>_<lat>_<lng>')
def get_data_point(hour, lat, lng):
    rain = ctl_wrf.get_point_data(wrf, "rain", lat, lng, hour)
    wind = ctl_inawave.get_point_data(inawave, "wind", lat, lng, hour)
    current = ctl_inaflow.get_point_data(inaflow, "current", lat, lng, hour)
    wave = ctl_inawave.get_point_data(inawave, "wave", lat, lng, hour)
    point = {"rain": rain, "wind": wind, "current": current, "wave": wave}
    print(point)
    return jsonify({"rain": str(rain), "wind": wind, "current": current, "wave": wave})


@app.route('/raster/weather/inawave_<type>_<hour>.png')
def serve_inawave(type, hour):
    hour3 = math.floor(int(hour) / 3)
    buffer = dir + '/tmp/inawave_{}_{}.png'.format(type, hour3)
    if os.path.isfile(buffer):
        return send_file(buffer, mimetype='image/png')
    image = ctl_inawave.get_raster(type, inawave, int(hour3))
    image.save(buffer, format="PNG")
    return send_file(buffer, mimetype='image/png')


@app.route('/raster/weather/inaflow_<type>_<hour>.png')
def serve_inaflow(type, hour):
    hour3 = math.floor(int(hour) / 3)
    buffer = dir + '/tmp/inaflow_{}_{}.png'.format(type, hour3)
    if os.path.isfile(buffer):
        return send_file(buffer, mimetype='image/png')
    image = ctl_inaflow.get_raster(type, inaflow, int(hour3))
    image.save(buffer, format="PNG")
    return send_file(buffer, mimetype='image/png')


@app.route('/timeserver')
def get_time():
    return jsonify(time_ctr)


def thread_ais():
    ship = ship_ais.Ship(ship_ais.surabaya_balikpapan)
    ship.simul(socketio.emit)
    ship_ais.Ship(list(reversed(ship_ais.surabaya_balikpapan)))
    ship.simul(socketio.emit)
    thread_ais()


if __name__ == '__main__':
    wrf = Dataset(dir + '\\data\\prediction\\wrf\\semar_latest.nc', 'r', format="NETCDF4")
    inaflow = Dataset(dir + '\\data\\prediction\\inaflow\\file.nc', 'r', format="NETCDF4")
    inawave = Dataset(dir + '\\data\\prediction\\inawave\\file.nc', 'r', format="NETCDF4")
    threads = [thread_ais]
    for thread in threads:
        t = threading.Thread(target=thread)
        t.daemon = True
        t.start()
    # ina_flow = Dataset(dir + '\\data\\prediction\\wrf\\semar_latest.nc', 'r', format="NETCDF4")
    # ina_wave = Dataset(dir + '\\data\\prediction\\wrf\\semar_latest.nc', 'r', format="NETCDF4")
    socketio.run(app, port=8090, debug=True, host="0.0.0.0")
