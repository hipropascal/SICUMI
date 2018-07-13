from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine

Base = declarative_base()


class RasterData(Base):
    __tablename__ = 'RASTER_DATA'
    id = Column(Integer, primary_key=True)
    filename = Column(String(250), nullable=False)
    creation_time = Column(DateTime, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)


class RasterImage(Base):
    __tablename__ = 'RASTER_IMAGE'
    id = Column(Integer, primary_key=True)
    id_raster_data = Column(Integer)
    filename = Column(String(250), nullable=False)
    time = Column(DateTime, nullable=False)


def db_connect():
    engine = create_engine('sqlite:///catalog.db')
    Base.metadata.create_all(engine)
    return engine
