from PIL import Image, ImageDraw
import numpy as np
from numba import jit, cuda


def encode_uv_image_refactory(U, V, bound):
    maxU = np.max(U)
    minU = np.min(U)
    maxV = np.max(V)
    minV = np.min(V)
    width = U.shape[1]
    height = U.shape[0]
    arr_blue = np.full((height, width), 0, dtype=np.uint8).flatten()
    arr_alpha = np.full((height, width), 255, dtype=np.uint8).flatten()
    Uscale = (maxU - minU) / 255
    Vscale = (maxV - minV) / 255
    uscaled = np.divide(np.add(U, abs(minU)), Uscale).flatten()
    vscaled = np.divide(np.add(V, abs(minV)), Vscale).flatten()
    join_arr = np.vstack((uscaled, vscaled, arr_blue, arr_alpha)).T
    join_arr = join_arr.reshape(height, width, 4)
    arr = np.flipud(join_arr).astype(dtype=np.int8)
    img = Image.fromarray(arr, 'RGBA')
    # UV|minU|maxU|minV|maxV|TOP|BOTTOM|LEFT|RIGHT
    info = "UV|{}|{}|{}|{}|{}|{}|{}|{}xxxx".format(minU, maxU, minV, maxV, bound["top"], bound["bottom"], bound["left"],
                                                   bound["right"])
    return add_info(img, info)


def encode_uv_image(U, V, bound):
    maxU = np.max(U)
    minU = np.min(U)
    maxV = np.max(V)
    minV = np.min(V)
    width = U.shape[1]
    height = U.shape[0]
    arr = np.zeros((height, width - 1, 4), dtype=np.uint8)
    Uscale = (maxU - minU) / 255
    Vscale = (maxV - minV) / 255
    for i, row in enumerate(arr):
        for j, val in enumerate(row):
            arr[i, j, 0], arr[i, j, 1], arr[i, j, 3] = int((U[i, j] + abs(minU)) / Uscale), \
                                                       int((V[i, j] + abs(minV)) / Vscale), \
                                                       255

            if U[i, j] + V[i, j] == 0:
                arr[i, j, 3] = 0
    arr = np.flipud(arr)
    img = Image.fromarray(arr, 'RGBA')
    # UV|minU|maxU|minV|maxV|TOP|BOTTOM|LEFT|RIGHT
    info = "UV|{}|{}|{}|{}|{}|{}|{}|{}xxxx".format(minU, maxU, minV, maxV, bound["top"], bound["bottom"], bound["left"],
                                                   bound["right"])
    return add_info(img, info)


def encode_image(dset, bound):
    bitrange = 16777200.0  # 24 bit RGB image range 2^24
    width = dset.shape[1]
    height = dset.shape[0]
    maxval = np.max(dset)
    minval = np.min(dset)
    arr = np.zeros((height, width - 1, 4), dtype=np.uint8)
    scale = (maxval - minval) / bitrange
    dset = np.flipud(dset)
    for i, row in enumerate(arr):
        for j, val in enumerate(row):
            binr = "{0:024b}".format \
                (int((dset[i, j] - minval) / scale))
            arr[i, j, 0], arr[i, j, 1], arr[i, j, 2], arr[i, j, 3] = int(binr[0:8], 2), \
                                                                     int(binr[8:16], 2), \
                                                                     int(binr[16:24], 2), \
                                                                     255
            if dset[i, j] == 0:
                arr[i, j, 3] = 0
    img = Image.fromarray(arr, 'RGBA')
    # RASTER|minval|maxval|TOP|BOTTOM|LEFT|RIGHT
    info = "RASTER|{}|{}|{}|{}|{}|{}xxxx".format(minval, maxval, bound["top"], bound["bottom"], bound["left"],
                                                 bound["right"])
    return add_info(img, info)


def encode_image_dir(dset, bound):
    bitrange = 16777200.0  # 24 bit RGB image range 2^24
    width = dset.shape[1]
    height = dset.shape[0]
    maxval = np.max(dset)
    minval = np.min(dset)
    arr = np.zeros((height, width - 1, 4), dtype=np.uint8)
    scale = (maxval - minval) / bitrange
    dset = np.flipud(dset)
    for i, row in enumerate(arr):
        for j, val in enumerate(row):
            if np.ma.is_masked(dset[i, j]):
                arr[i, j, 3] = 0
            else:
                binr = "{0:024b}".format \
                    (int((dset[i, j] - minval) / scale))
                arr[i, j, 0], arr[i, j, 1], arr[i, j, 2], arr[i, j, 3] = int(binr[0:8], 2), \
                                                                         int(binr[8:16], 2), \
                                                                         int(binr[16:24], 2), \
                                                                         255
    img = Image.fromarray(arr, 'RGBA')
    # RASTER|minval|maxval|TOP|BOTTOM|LEFT|RIGHT
    info = "RASTER|{}|{}|{}|{}|{}|{}xxxx".format(minval, maxval, bound["top"], bound["bottom"], bound["left"],
                                                 bound["right"])
    return add_info(img, info)


def add_info(img, info):
    draw = ImageDraw.Draw(img)
    # draw.rectangle([0, 0, width - 1, 1], fill=(0, 0, 0, 0))
    seq = 0
    for i, ch in enumerate(info):
        if (i + 1) % 3 == 0:
            blue = ord(info[i])
            green = ord(info[i - 1])
            red = ord(info[i - 2])
            x = seq
            x1 = seq + 1
            seq += 1
            alpha = 255
            draw.rectangle([x, 0, x1, 1], fill=(red, green, blue, alpha))
    return img


if __name__ == '__main__':
    from netCDF4 import Dataset, num2date

    flow = Dataset('..\\..\\data\\prediction\\inaflow\\file.nc', 'r', format="NETCDF4")
    lat = flow.variables["lat"][:]
    lng = flow.variables["lon"][:]
    bound = {
        "top": np.max(lat),
        "bottom": np.min(lat),
        "left": np.min(lng),
        "right": np.max(lng)
    }
    u = flow.variables["u"][1][:]
    v = flow.variables["v"][1][:]
    img = encode_uv_image(u, v, bound)
    img.show()
