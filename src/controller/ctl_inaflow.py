import numpy as np
import math
import src.stegano as image
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
    if type == "current":
        u = dset.variables["u"][hour][0][:]
        v = dset.variables["v"][hour][0][:]
        image_result = image.encode_uv_image(u, v, bound)
    return image_result


def get_point_data(dset,type,lat,lng,hour):
    lats = dset.variables["lat"][:]
    lngs = dset.variables["lon"][:]
    top = float(np.max(lats))
    bottom = float(np.min(lats))
    left = float(np.min(lngs))
    right = float(np.max(lngs))
    ratio_lat = (float(lat) - bottom) / (top - bottom)
    ratio_lng = (float(lng) - left) / (right - left)
    ypos = math.floor(lats.shape[0] * ratio_lat)
    xpos = math.floor(lngs.shape[0] * ratio_lng)
    if type == "current":
        u = dset.variables["u"][hour][0][ypos][xpos]
        v = dset.variables["v"][hour][0][ypos][xpos]
        mag = math.sqrt(math.pow(u, 2) + math.pow(v, 2))
        rad = math.atan2(u, v)
        deg = rad * 180 / math.pi
        return {"dir": str(deg), "mag": str(mag)}