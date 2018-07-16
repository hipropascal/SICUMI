from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine

Base = declarative_base()


class RasterUpdatePackage(Base):
    __tablename__ = 'RASTER_UPDATE_PACKAGE'
    id = Column(Integer, primary_key=True)
    date = Column(DateTime, nullable=False)
    download_success = Column(Integer, nullable=False)
    download_fail = Column(Integer, nullable=False)
    data_transferred = Column(Float, nullable=False)


class RasterData(Base):
    __tablename__ = 'RASTER_DATA'
    id = Column(Integer, primary_key=True)
    update_id = Column(Integer,nullable=False)
    filename = Column(String(250), nullable=False)
    creation_time = Column(DateTime, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)


class RasterImageZip(Base):
    __tablename__ = 'RASTER_IMAGE_ZIP'
    id = Column(Integer, primary_key=True)
    id_raster_data = Column(Integer)
    filename = Column(String(250), nullable=False)
    time = Column(DateTime, nullable=False)


class Vessel(Base):
    _tablename__ = 'VESSEL'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=True)
    mmsi = Column(String, nullable=False)
    type = Column(Integer, nullable=False)
    flag_id = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    weight = Column(Integer, nullable=False)
    draught = Column(Integer, nullable=False)
    year_build = Column(Integer, nullable=False)
    user_token = Column(String(10), primary_key=True)
    have_aws = Column(Integer, nullable=False)
    have_ais = Column(Integer, nullable=False)
    have_radar = Column(Integer, nullable=False)
    location_report_lat = Column(Float, nullable=True)
    location_report_lng = Column(Float, nullable=True)
    location_report_date = Column(DateTime, nullable=True)


class VesselMovement(Base):
    __tablename__ = 'VESSEL_MOVEMENT'
    id = Column(Integer, primary_key=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    speed = Column(Float, nullable=False)
    direction = Column(Float, nullable=False)
    report_time = Column(DateTime, nullable=False)


class VesselAWSVerificator(Base):
    __tablename__ = 'VESSEL_AWS_VERIFICATOR'
    id = Column(Integer, nullable=False)
    vessel_id = Column(Integer, nullable=False)
    ofs_update_package = Column(DateTime, nullable=False)
    ofs_time = Column(DateTime, nullable=False)
    ofs_wind_speed = Column(Float, nullable=False)
    ofs_wind_direction = Column(Float, nullable=False)
    ofs_wave_height = Column(Float, nullable=False)
    ofs_wave_direction = Column(Float, nullable=False)
    aws_time = Column(DateTime, nullable=False)
    aws_wind_speed = Column(Float, nullable=False)
    aws_wind_direction = Column(Float, nullable=False)


class VesselVisualVerificator(Base):
    __tablename__ = 'VESSEL_VISUAL_VERIFICATOR'
    id = Column(Integer, nullable=False)
    vessel_id = Column(Integer, nullable=False)
    ofs_update_package = Column(DateTime, nullable=False)
    ofs_time = Column(DateTime, nullable=False)
    ofs_wind_speed = Column(Float, nullable=False)
    ofs_wind_direction = Column(Float, nullable=False)
    ofs_wave_height = Column(Float, nullable=False)
    ofs_wave_direction = Column(Float, nullable=False)
    visual_time = Column(DateTime, nullable=False)
    visual_wave_height = Column(Float, nullable=False)
    visual_wave_direction = Column(Float, nullable=False)
    visual_wind_height = Column(Float, nullable=False)
    visual_wind_direction = Column(Float, nullable=False)


class VesselReportCategory(Base):
    __tablename__ = 'VESSEL_REPORT_CATEGORY'
    id = Column(Integer, primary_key=True)
    category_name = Column(String, nullable=False)
    level = Column(Integer, nullable=False)


class VesselReport(Base):
    __tablename__ = 'VESSEL_REPORT'
    id = Column(Integer, primary_key=True)
    category_id = Column(String, nullable=False)
    broadcast_ais = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    pos_lat = Column(Float, nullable=False)
    pos_lng = Column(Float, nullable=False)
    distance_from_pos = Column(Float, nullable=False)
    direction = Column(Float, nullable=False)


def db_connect():
    engine = create_engine('sqlite:///catalog.db')
    Base.metadata.create_all(engine)
    return engine