import numpy as np
import src.stegano as image
from math import pi, cos, sin, floor, sqrt, atan2, pow
from netCDF4 import Dataset, num2date


def get_raster(type, dset, hour):
    lat = dset.variables["lat"][:]
    lng = dset.variables["lon"][:]
    image_result = None
    bound = {
        "top": np.max(lat),
        "bottom": np.min(lat),
        "left": np.min(lng),
        "right": np.max(lng)
    }
    if type == "hs":
        hs = dset.variables["hs"][hour][:]
        image_result = image.encode_image(hs, bound)
    if type == "hmax":
        hmax = dset.variables["hmax"][hour][:]
        image_result = image.encode_image(hmax, bound)
    if type == "dir":
        dir = dset.variables["dir"][hour][:]
        image_result = image.encode_image_dir(dir, bound)
    if type == "wind":
        uwnd = dset.variables["uwnd"][hour][:]
        vwnd = dset.variables["vwnd"][hour][:]
        image_result = image.encode_uv_image(uwnd, vwnd, bound)
    if type == "wave":
        hs = dset.variables["hs"][hour][:]
        dir_msk = dset.variables["dir"][hour][:]
        dir = np.ma.filled(dir_msk, fill_value=0)
        theta = dir * pi / 180
        uwave = hs * np.cos(theta)
        vwave = hs * np.sin(theta)
        image_result = image.encode_uv_image(uwave, vwave, bound)
    return image_result


def get_point_data(dset, type, lat, lng, hour):
    lats = dset.variables["lat"][:]
    lngs = dset.variables["lon"][:]
    top = float(np.max(lats))
    bottom = float(np.min(lats))
    left = float(np.min(lngs))
    right = float(np.max(lngs))
    ratio_lat = (float(lat) - bottom) / (top - bottom)
    ratio_lng = (float(lng) - left) / (right - left)
    ypos = floor(lats.shape[0] * ratio_lat)
    xpos = floor(lngs.shape[0] * ratio_lng)
    if type == "wave":
        dir = dset.variables["dir"][hour][ypos][xpos]
        hs = dset.variables["hs"][hour][ypos][xpos]
        return {"dir": str(dir), "height": str(hs)}
    if type == "wind":
        uwnd = dset.variables["uwnd"][hour][ypos][xpos]
        vwnd = dset.variables["vwnd"][hour][ypos][xpos]
        mag = sqrt(pow(uwnd, 2) + pow(vwnd, 2))
        rad = atan2(uwnd, vwnd)
        deg = rad * 180 / pi
        return {"dir": str(deg), "mag": str(mag)}
