import logging
import datetime

from google.appengine.datastore.datastore_query import Cursor

from google.appengine.ext import ndb
from google.appengine.api import memcache

from guestbookdemo.appconstants import AppConstants


class Greeting(ndb.Model):
    author = ndb.StringProperty()
    content = ndb.StringProperty()
    date = ndb.DateTimeProperty(auto_now_add=True)
    updated_by = ndb.StringProperty()
    updated_date = ndb.DateTimeProperty(auto_now_add=False)

    @classmethod
    def get_key_from_name(cls, guestbook_name=None):
        return ndb.Key('guestbookdemo',
                       guestbook_name or AppConstants.get_default_guestbook_name())

    def to_dict(self, include=None, exclude=None):
        dict = {
            "id_greeting": self.key.id(),
            "content": self.content,
            "date": self.date.strftime("%Y-%m-%d %H:%M +0000")
        }

        if self.author:
            dict['author'] = self.author

        if self.updated_date:
            dict['updated_date'] = self.updated_date.strftime("%Y-%m-%d %H:%M +0000")

        if self.updated_by:
            dict['updated_by'] = self.updated_by

        return dict


class Guestbook:

    @classmethod
    def get_lastest_greeting(cls, guestbook_name,
                             number_of_greeting=AppConstants.get_default_number_of_greeting()):
        greetings = memcache.get('%s:greetings' % guestbook_name)
        if greetings is None:
            guestbook_key = Greeting.get_key_from_name(guestbook_name)
            greetings_query = Greeting.query(
                ancestor=guestbook_key).order(-Greeting.date)
            greetings = greetings_query.fetch(number_of_greeting)

            if not memcache.add('%s:greetings' % guestbook_name, greetings,
                                AppConstants.get_default_cache_time()):
                logging.error('Memcache set failed.')

        return greetings

    @classmethod
    def get_page(cls, guestbook_name, pagesize, curs_str=None, content_filter=None):
        if pagesize <= 0:
            items = None
            nextcurs = None
            more = None
        try:
            guestbook_key = Greeting.get_key_from_name(guestbook_name)
            curs = Cursor(urlsafe=curs_str)
            query = Greeting.query(ancestor=guestbook_key)
            if content_filter:
                query = query.filter(Greeting.content == content_filter)
            query = query.order(-Greeting.date)
            items, nextcurs, more = query.fetch_page(pagesize, start_cursor=curs)
        except:
            items = None
            nextcurs = None
            more = None

        return items, nextcurs, more

    @classmethod
    def get_total_count(cls, guestbook_name, content_filter=None):
        guestbook_key = Greeting.get_key_from_name(guestbook_name)
        query = Greeting.query(
                ancestor=guestbook_key)
        if content_filter:
            query = query.filter(Greeting.content == content_filter)

        return query.count()

    @classmethod
    def put_greeting_with_data(cls, guestbook_name, greeting_author, greeting_content):
        guestbook_key = Greeting.get_key_from_name(guestbook_name)

        @ndb.transactional
        def put_greeting_to_db():
            greeting = Greeting(parent=guestbook_key)
            greeting.author = greeting_author
            greeting.content = greeting_content

            # save object
            greeting.put()

            # clear cache
            memcache.delete('%s:greetings' % guestbook_name)

            return greeting

        new_greeting = put_greeting_to_db()

        return new_greeting

    @classmethod
    def delete_greeting_by_id(cls, guestbook_name, greeting_id):
        try:
            id = int(greeting_id)
        except ValueError:
            return False

        if int(id) > 0:
            key = ndb.Key('guestbookdemo', guestbook_name, Greeting, int(id))
            if key:
                greeting = key.get()

                if greeting:
                    key.delete()

                    # clear cache
                    memcache.delete('%s:greetings' % guestbook_name)
                    return True
                else:
                    return False
            else:
                return False
        else:
            return False

    @classmethod
    def get_greeting_by_id(cls, guestbook_name, greeting_id):
        try:
            id = int(greeting_id)
        except ValueError:
            return None

        if int(id) > 0:
            key = ndb.Key('guestbookdemo', guestbook_name,
                          Greeting, int(id))
            if key:
                greeting = key.get()
                if greeting:
                    return greeting
                else:
                    return None
            else:
                return None
        else:
            return None

    @classmethod
    def update_greeting_by_id(cls, guestbook_name, greeting_id, greeting_content, updated_by):

        greeting = cls.get_greeting_by_id(guestbook_name, greeting_id)
        if greeting:
            @ndb.transactional
            def update_greeting(greeting_content):
                greeting.content = greeting_content
                greeting.updated_by = updated_by
                greeting.updated_date = datetime.datetime.now()

                greeting.put()

                # clear cache
                memcache.delete('%s:greetings' % guestbook_name)

                return greeting

            updated_greeting = update_greeting(greeting_content)

            return updated_greeting
        else:
            return None
