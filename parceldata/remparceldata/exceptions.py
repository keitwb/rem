class ParcelDataError(Exception):
    def __str__(self):
        return "%s: %s" % (self.__class__.__name__, super(ParcelDataError, self).__str__())


class NoFeatureError(ParcelDataError):
    pass


class MultipleFeaturesError(ParcelDataError):
    pass


class NoAdapterError(ParcelDataError):
    pass
