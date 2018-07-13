import os
import time
import datetime
from math import pi
import numpy as np
import src.stegano as image
from netCDF4 import Dataset, num2date
from sqlalchemy.orm import sessionmaker
from src.db.dbscheme import RasterData, RasterImage, db_connect

dir_root = os.path.dirname(os.path.realpath(__file__))
dir_raster = ".\\raster\\image\\"


def get_raster_inawave(type, dset, id_data, session):
    lat = dset.variables["lat"][:]
    lng = dset.variables["lon"][:]
    bound = {
        "top": np.max(lat),
        "bottom": np.min(lat),
        "left": np.min(lng),
        "right": np.max(lng)
    }
    times = dset.variables["time"]
    times_arr = num2date(times[:], units=times.units, calendar='standard')
    for hour, str_time in enumerate(times_arr):
        if type == "hs":
            hs = dset.variables["hs"][hour][:]
            image_result = image.encode_image(hs, bound)
            fname = str_time.strftime(dir_raster + "inawave_hs_%Y-%m-%d-%H.png")
            new_raster_image = RasterImage(id_raster_data=id_data, filename=fname, time=datetime.datetime.now())
            session.add(new_raster_image)
            session.commit()
            image_result.save(fname, format="PNG")
        if type == "hmax":
            hmax = dset.variables["hmax"][hour][:]
            image_result = image.encode_image(hmax, bound)
            fname = str_time.strftime(dir_raster + "inawave_hmax_%Y-%m-%d-%H.png")
            image_result.save(fname, format="PNG")
            new_raster_image = RasterImage(id_raster_data=id_data, filename=fname, time=datetime.datetime.now())
            session.add(new_raster_image)
            session.commit()
        if type == "wind":
            uwnd = dset.variables["uwnd"][hour][:]
            vwnd = dset.variables["vwnd"][hour][:]
            image_result = image.encode_uv_image_refactory(uwnd, vwnd, bound)
            fname = str_time.strftime(dir_raster + "inawave_wind_%Y-%m-%d-%H.png")
            image_result.save(fname, format="PNG")
            new_raster_image = RasterImage(id_raster_data=id_data, filename=fname, time=datetime.datetime.now())
            session.add(new_raster_image)
            session.commit()
        if type == "wave":
            hs = dset.variables["hs"][hour][:]
            dir_msk = dset.variables["dir"][hour][:]
            dir = np.ma.filled(dir_msk, fill_value=0)
            theta = dir * pi / 180
            uwave = hs * np.cos(theta)
            vwave = hs * np.sin(theta)
            image_result = image.encode_uv_image_refactory(uwave, vwave, bound)
            fname = str_time.strftime(dir_raster + "inawave_wave_%Y-%m-%d-%H.png")
            image_result.save(fname, format="PNG")
            new_raster_image = RasterImage(id_raster_data=id_data, filename=fname, time=datetime.datetime.now())
            session.add(new_raster_image)
            session.commit()
    return True


def get_raster_inaflow(type, dset, id_data, session):
    lat = dset.variables["lat"][:]
    lng = dset.variables["lon"][:]
    bound = {
        "top": np.max(lat),
        "bottom": np.min(lat),
        "left": np.min(lng),
        "right": np.max(lng)
    }
    times = dset.variables["time"]
    times_arr = num2date(times[:], units=times.units, calendar='standard')
    for hour, str_time in enumerate(times_arr):
        if type == "current":
            u = dset.variables["u"][hour][0][:]
            v = dset.variables["v"][hour][0][:]
            image_result = image.encode_uv_image_refactory(u, v, bound)
            fname = str_time.strftime(dir_raster + "inaflow_current_%Y-%m-%d-%H.png")
            image_result.save(fname, format="PNG")
            new_raster_image = RasterImage(id_raster_data=id_data, filename=fname, time=datetime.datetime.now())
            session.add(new_raster_image)
            session.commit()
    return True


# def get_raster_wrf(type, dset):
#     lat = dset.variables["lat"][:]
#     lng = dset.variables["lng"][:]
#     image_result = None
#     bound = {
#         "top": np.max(lat),
#         "bottom": np.min(lat),
#         "left": np.min(lng),
#         "right": np.max(lng)
#     }
#     lentime = dset.variables["U10"].shape()[0]
#     for hour in range(0, lentime):
#         if type == "wind":
#             U = dset.variables["U10"][hour][:]
#             V = dset.variables["V10"][hour][:]
#             image_result = image.encode_uv_image_refactory(U, V, bound)
#         if type == "rain":
#             rain = dset.variables["rain"][hour][:]
#             image_result = image.encode_image(rain, bound)
#         if type == "cloud":
#             cloud = dset.variables["cloud"][hour][:]
#             image_result = image.encode_image(cloud, bound)
#         return image_result


def update_data():
    DBSession = sessionmaker(bind=db_connect())
    session = DBSession()
    inaflow_list = []
    for root, dirs, files in os.walk(".\\raster\\data\\fvcom"):
        for file in files:
            if "InaFlows" in file:
                inaflow_list.append(os.path.join(root, file))
    inaflow_list = sorted(inaflow_list)
    inaflow_newest = inaflow_list[0]
    inaflow_basename = os.path.basename(inaflow_newest)
    is_exists = session.query(RasterData).filter(RasterData.filename.like("%{}%".format(inaflow_basename))).count()
    if is_exists == 0:
        inaflow = Dataset(inaflow_newest, 'r', format="NETCDF4")
        creation_date = datetime.datetime.fromtimestamp(os.path.getctime(inaflow_newest))
        times = inaflow.variables['time']
        time_start = num2date(times[0], units=times.units)
        time_end = num2date(times[-1], units=times.units)
        new_raster_data = RasterData(filename=inaflow_newest, creation_time=creation_date,
                                     start_time=time_start, end_time=time_end)
        session.add(new_raster_data)
        session.flush()
        id_data = new_raster_data.id
        get_raster_inaflow("current", inaflow, id_data, session)
        session.commit()

    inawave_list = []
    for root, dirs, files in os.walk(".\\raster\\data\\ww3"):
        for file in files:
            if "hires" in file:
                inawave_list.append(os.path.join(root, file))
    inawave_list = sorted(inawave_list)
    inawave_newest = inawave_list[0]
    inawave_basename = os.path.basename(inawave_newest)
    is_exists = session.query(RasterData).filter(RasterData.filename.like("%{}%".format(inawave_basename))).count()
    if is_exists == 0:
        inawave = Dataset(inawave_newest, 'r', format="NETCDF4")
        creation_date = datetime.datetime.fromtimestamp(os.path.getctime(inawave_newest))
        times = inawave.variables['time']
        time_start = num2date(times[0], units=times.units)
        time_end = num2date(times[-1], units=times.units)
        new_raster_data = RasterData(filename=inawave_newest, creation_time=creation_date,
                                     start_time=time_start, end_time=time_end)
        session.add(new_raster_data)
        session.flush()
        id_data = new_raster_data.id
        get_raster_inawave("wave", inawave, id_data, session)
        get_raster_inawave("wind", inawave, id_data, session)
        session.commit()


if __name__ == '__main__':
    update_data()
