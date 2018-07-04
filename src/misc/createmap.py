from mpl_toolkits.basemap import Basemap
import matplotlib.pyplot as plt

def create_map():
    fig = plt.figure(1, frameon=False, dpi=1500)
    fig.add_axes([0, 0, 1, 1])
    m = Basemap(projection='merc', llcrnrlat=-15, urcrnrlat=13, llcrnrlon=90, urcrnrlon=145,
                lat_ts=20, resolution='c')
    m.fillcontinents(color='black')
    plt.savefig('indonesia.png', pad_inches=0.0, bbox_inches='tight')

if __name__ == '__main__':
    create_map()