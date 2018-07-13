from netCDF4 import Dataset, num2date
from time import strftime

# wrf = Dataset("InaFlow.nc","r")
# times = wrf.variables['time']
# times_arr = num2date(times[:],units=times.units, calendar='standard')
# for t in times_arr:
#     print(t.strftime("%Y-%m-%d-%H"))
# print(times_arr)

dset = Dataset("InaWave.nc","r")
times = dset.variables['time']
times_arr = num2date(times[:],units=times.units, calendar='standard')
for t in times_arr:
    print(t.strftime("%Y-%m-%d-%H"))
print(times_arr)