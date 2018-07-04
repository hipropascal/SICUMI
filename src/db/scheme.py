from sqlalchemy import create_engine,Column, ForeignKey, Integer, String, Float, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship,Session
import yaml
import os

Base = declarative_base()
file_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../config/app.yaml')
with open(file_dir, 'r') as stream:
    db = yaml.load(stream)["dbconnect"]
    enginestr = ("postgresql://{}:{}@{}:{}/{}").format(db['user'],db['password'],db['host'],db['port'],db['dbname'])
    engine = create_engine(enginestr)


class Log_ais_handler(Base):
    __tablename__ = 'LOG_AIS_HANDLER'
    id = Column(Integer, primary_key=True, doc='Id for indexing')
    file_name = Column(String(50), nullable=True, doc="Filename")
    start_parser_at = Column(DateTime, nullable=True, doc="In UTC")
    duration = Column(Float, nullable=True, doc="Duration from start_parser_at to end in second")
    record_count = Column(Integer, nullable=True, doc="Record that has been proceed")

class Data_ship_basic(Base):
    __tablename__ = 'DAT_SHIP_BASIC'
    id = Column(Integer, primary_key=True, doc='Id for indexing')
    mmsi = Column(Integer, nullable=False, doc="Id given to ais devices")
    name = Column(String(30), nullable=True, doc="Name of ship that more humanable language")
    code_name = Column(String(30), nullable=True, doc="Known as call_sign")
    type = Column(Integer, nullable=True, default=0, doc="Populate on PAR_SHIP_CATEGORY")
    draught = Column(Integer, nullable=True, doc="Describe ship size in Meter")
    utc = Column(DateTime, nullable=True, doc='Time in UTC')
    eta_month = Column(Integer, nullable=True, doc="ETA to destination")
    eta_day = Column(Integer, nullable=True, doc="ETA to destination")
    eta_hour = Column(Integer, nullable=True, doc="ETA to destination")
    eta_minute = Column(Integer, nullable=True, doc="ETA to destination")
    destination = Column(String(30), nullable=True, doc="ETA to destination")

class Data_ship_receiver(Base):
    __tablename__ = 'DAT_SHIP_RECEIVER'
    id = Column(Integer, primary_key=True, doc='1:LAPAN A2,2:LAPAN A3, Other using mmsi')
    lat = Column(Float, nullable=True, doc='Longitude')
    lng = Column(Float, nullable=True, doc='Latitude')
    device = Column(String(30), nullable=True, doc='Device Info')
    device_category = Column(String(30), nullable=True, doc='1: type A, 2:type B')

class Data_ship_report(Base):
    __tablename__ = 'DAT_SHIP_REPORT'
    id = Column(Integer, primary_key=True, doc='Id for indexing')
    mmsi = Column(Integer, nullable=True, doc='Id given to ais devices')
    utc = Column(DateTime, nullable=True, doc='Time in UTC')
    lng = Column(Float, nullable=True, doc='Latitude')
    lat = Column(Float, nullable=True, doc='Longitude')
    rot = Column(Integer, nullable=True, doc='Rotation / direction')
    sog = Column(Float, nullable=True, doc='Speed over ground')
    cog = Column(Float, nullable=True, doc='Course over dround')
    hdg = Column(Integer, nullable=True, doc='Heading')
    mode = Column(String(30), nullable=True, doc='Mode')
    acurracy = Column(Integer, nullable=True, doc='1: low, 2: high')
    receiver_id = Column(Integer, doc='Id station')
    land_check = Column(Boolean, nullable=True, doc='0:on land, 1:on sea')

class Param_ship_category(Base):
    __tablename__ = 'PAR_SHIP_CATEGORY'
    id = Column(Integer, primary_key=True, doc='Id for indexing')
    name = Column(String(250), nullable=False, doc='Categoty name populate by ship')
    cat_name = Column(String(250), nullable=False, doc='Categoty name, but more general')


class Log_fish_handler(Base):
    __tablename__ = 'LOG_FISH_HANDLER'
    id = Column(Integer, primary_key=True, doc='Id for indexing')
    file_name = Column(String(50), nullable=True, doc="Filename")


class Data_fish(Base):
    __tablename__ = 'DAT_FISH'
    id = Column(Integer, primary_key=True, doc='Id for indexing')
    utc = Column(DateTime, nullable=True, doc='1:low, 2:medium, 3:high')
    lat = Column(Float, nullable=True, doc='Latitude')
    lng = Column(Float, nullable=True, doc='Longitude')
    potential = Column(String(30), nullable=True, doc='1:low, 2:medium, 3:high')


def session():
    session = Session(engine)
    return session


def initdata(db):
    file_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../data/satelite/LAPAN/ship_type.csv')
    with open(file_dir, 'r') as file:
        fileatr = file.read()
        ctgs = []
        rows = fileatr.split('\n')
        for row in rows:
            field = row.split(';')
            if(len(field) <= 1):
                continue
            ctg = {
                "id": field[0],
                "name": field[1],
                "cat_name": field[2]
            }
            ctgs.append(ctg)
    db.bulk_insert_mappings(Param_ship_category,ctgs)
    receivers = [
        {
            "id": 1,
            "mmsi": 1,
            "lat":0,
            "lng":0,
            "device":"Satelite Lapan A2",
            "device_category":1
        },
        {
            "id": 2,
            "mmsi": 2,
            "lat": 0,
            "lng": 0,
            "device": "Satelite Lapan A2",
            "device_category": 1
        },

    ]
    db.bulk_insert_mappings(Data_ship_receiver,receivers)
    db.commit()
    db.close()

def setupDB():
    engine = create_engine(enginestr)
    Base.metadata.create_all(engine)
    initdata(Session(engine))
