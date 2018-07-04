import os
import logging


def log(filename, log):
    dirlog = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../log')
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    handler = logging.FileHandler(os.path.join(dirlog, filename + '.log'))
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.info(log)


if __name__ == '__main__':
    log("himawari", "test123")
