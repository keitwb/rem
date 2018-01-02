import numbers

def single_quote_if_string(val):
    if not isinstance(val, numbers.Number):
        return "'%s'" % val

    return val

