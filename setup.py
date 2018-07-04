import os
from sqlalchemy import text
import src.db.scheme as scheme


def init():
    scheme.setupDB()
    db = scheme.session()
    dirquery = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data/dbquery')
    for filename in os.listdir(dirquery):
        with open(os.path.join(dirquery, filename), 'r') as f:
            db.execute(text(f.read()))


if __name__ == '__main__':
    init()
