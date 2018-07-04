
import numpy as np
from math import floor, ceil


def intrp_bil(arr, shape):
    '''
    interpolate1 (arr:ndarray, shape:tuple2)
    Bilinier interpolation, nearest value
    '''
    newarr = np.zeros(shape, dtype=float)
    xstep = shape[0] / arr.shape[0]
    ystep = shape[1] / arr.shape[1]
    multi = ceil(xstep if xstep > ystep else ystep)
    if multi > 1:
        arr = multires(arr, multi)
        xstep = shape[0] / arr.shape[0]
        ystep = shape[1] / arr.shape[1]
    for x, row in enumerate(newarr):
        for y, val in enumerate(row):
            posx = x / xstep
            posy = y / ystep
            xratio = posx - floor(posx)
            yratio = posy - floor(posy)
            x1y1 = arr[floor(posx), floor(posy)]
            x1y2 = arr[floor(posx), ceil(posy)]
            x2y2 = arr[ceil(posx), ceil(posy)]
            x2y1 = arr[ceil(posx), floor(posy)]
            top_line = (x1y1 * xratio) + (x1y2 * (1 - xratio))
            botom_line = (x2y1 * xratio) + (x2y2 * (1 - xratio))
            newarr[x, y] = (top_line * yratio) + (botom_line * (1 - yratio))
    return newarr


def intrp_bic(arr, shape):
    '''
    interpolate2 (arr:ndarray, shape:tuple2)
    Bicubic interpolation, average value
    '''
    sumarr = np.zeros(shape, dtype=float)
    counter = np.zeros(shape, dtype=float)
    xstep = shape[0] / arr.shape[0]
    ystep = shape[1] / arr.shape[1]
    multi = ceil(xstep if xstep > ystep else ystep)
    if multi > 1:
        arr = multires(arr, multi)
        xstep = shape[0] / arr.shape[0]
        ystep = shape[1] / arr.shape[1]
    for x, row in enumerate(arr):
        for y, val in enumerate(row):
            posx = floor(x * xstep)
            posy = floor(y * ystep)
            sumarr[posx, posy] += val
            counter[posx, posy] += 1
    newarr = sumarr / counter
    return newarr


def multires(arr, multi):
    ''' multiply the resolution, exp: 128x128 to 256x256 with multi 2'''
    newarr = np.zeros((arr.shape[0] * multi, arr.shape[1] * multi))
    for x, row in enumerate(arr):
        for y, val in enumerate(row):
            x_arr, y_arr = x * multi, y * multi
            newarr[x_arr:(x_arr + multi), y_arr:(y_arr + multi)] = val
    return newarr


if __name__ == '__main__':
    pass
