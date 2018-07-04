def force(type,value):
    try:
        return type(value)
    except:
        return 0