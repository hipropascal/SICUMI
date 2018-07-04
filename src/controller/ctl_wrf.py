import numpy as np
import math
import src.stegano as image

def get_raster(type,dset,hour):
    lat = dset.variables["lat"][:]
    lng = dset.variables["lng"][:]
    image_result = None
    bound = {
        "top":np.max(lat),
        "bottom":np.min(lat),
        "left":np.min(lng),
        "right":np.max(lng)
    }
    if type == "wind":
        U = dset.variables["U10"][hour][:]
        V = dset.variables["V10"][hour][:]
        image_result = image.encode_uv_image(U, V, bound)
    if type == "rain":
        rain = dset.variables["rain"][hour][:]
        image_result = image.encode_image(rain, bound)
    if type == "cloud":
        cloud = dset.variables["cloud"][hour][:]
        image_result = image.encode_image(cloud, bound)
    return image_result


def get_point_data(dset,type,lat,lng,hour):
    lats = dset.variables["lat"][:]
    lngs = dset.variables["lng"][:]
    top = float(np.max(lats))
    bottom = float(np.min(lats))
    left = float(np.min(lngs))
    right = float(np.max(lngs))
    ratio_lat = math.floor((top - bottom) / (float(lat)-bottom))
    ratio_lng = math.floor((right - left) / (float(lng)-left))
    return dset.variables[type][hour][ratio_lat][ratio_lng]