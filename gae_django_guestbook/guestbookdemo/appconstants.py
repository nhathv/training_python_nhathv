__author__ = 'NhatHV'

DEFAULT_GUESTBOOK_NAME = 'default_guestbook'
DEFAULT_CACHE_TIME = 3600 * 24 * 30
DEFAULT_NUMBER_OF_GREETING = 10

class AppConstants:

    @classmethod
    def get_default_guestbook_name(cls):
        return DEFAULT_GUESTBOOK_NAME

    @classmethod
    def get_default_cache_time(cls):
        return DEFAULT_CACHE_TIME

    @classmethod
    def get_default_number_of_greeting(cls):
        return DEFAULT_NUMBER_OF_GREETING