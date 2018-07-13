import os
import sqlite3
import threading
from flask_socketio import SocketIO
from flask import Flask, render_template, jsonify, send_file
from src.test import ship_ais

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


@app.route('/timeserver')
def get_time():
    return jsonify(time_ctr)


@app.route('/get_raster/<filename>')
def get_raster(filename):
    return send_file("/raster/"+filename, mimetype='image/png')


@app.route('/get_raster_catalog')
def get_catalog(filename):
    return send_file("/raster/"+filename, mimetype='image/png')


def thread_ais():
    ship = ship_ais.Ship(ship_ais.surabaya_balikpapan)
    ship.simul(socketio.emit)
    thread_ais()


def run_apps():
    threads = [thread_ais]
    for thread in threads:
        t = threading.Thread(target=thread)
        t.daemon = True
        t.start()
    socketio.run(app, port=8090, debug=True, host="0.0.0.0")


if __name__ == '__main__':
    run_apps()

