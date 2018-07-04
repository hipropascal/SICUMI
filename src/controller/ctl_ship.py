from src.db.scheme import \
    Data_ship_basic as info, \
    Data_ship_report as report, \
    Data_ship_receiver as receiver, \
    Param_ship_category as category, \
    session

from sqlalchemy import text
import datetime

def getLastWeek():
    db = session()
    query_str = "SELECT * FROM LAST7DAYS"
    datas = db.execute(text(query_str))
    mmsi,name,lat,lng,type,hdg,sog,src,last_update_days,last_update_hour,last_update_minute = [],[],[],[],[],[],[],[],[],[],[]
    for data in datas:
        mmsi.append(data.mmsi)
        name.append(data.name)
        lat.append(data.lat)
        lng.append(data.lng)
        type.append(data.cat_name)
        hdg.append(data.hdg)
        sog.append(data.sog)
        src.append(data.src)
        last_update_days.append(data.last_update_days)
        last_update_hour.append(data.last_update_hour)
        last_update_minute.append(data.last_update_minute)
    db.close()
    return {
        "mmsi": mmsi,
        "name": name,
        "lat": lat,
        "lng": lng,
        "hdg":hdg,
        "sog": sog,
        "type":type,
        "src":src,
        "last_update_days": last_update_days,
        "last_update_hour": last_update_hour,
        "last_update_minute": last_update_minute
    }

def getShipDetail(mmsi):
    db = session()
    basicinfo = db.query(info).filter(info.mmsi==mmsi).order_by(info.id.desc()).first()
    currentinfo = db.query(report).filter(info.mmsi==mmsi).order_by(info.id.desc()).first()
    rec = db.query(receiver).filter(receiver.id == currentinfo.receiver_id).first().device
    db.close()
    return {
        "eta":[basicinfo.eta_month,basicinfo.eta_day,basicinfo.eta_hour,basicinfo.eta_minute],
        "destination":basicinfo.destination,
        "utc":basicinfo.utc.isoformat(),
        "draught":basicinfo.draught,
        "speed":currentinfo.sog,
        "cog":currentinfo.cog,
        "mode":currentinfo.mode,
        "rec_by": rec ,
    }


if __name__ == '__main__':
    getShipDetail(241274000)
