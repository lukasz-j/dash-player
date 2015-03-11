import sys
import urllib

import requests


yt_domain = 'http://www.youtube.com'
get_info_mapping = '/get_video_info?html5=1&video_id='

video_id_prefix = 'v='
mpd_entry_prefix = 'dashmpd='


def get_movie_id(url):
    for string in url.split('?'):
        if string.startswith(video_id_prefix):
            return string[len(video_id_prefix):]

    raise RuntimeError('Wrong url format')


def get_movie_info(movie_id):
    url = yt_domain + get_info_mapping + movie_id

    r = requests.get(url)

    if r.status_code == 200:
        return r.content
    else:
        raise RuntimeError('Error while getting info for movie: ' + movie_id)


def get_mpd_url(movie_info):
    for info in movie_info.split('&'):
        if info.startswith(mpd_entry_prefix):
            mpd_url = info[len(mpd_entry_prefix):]
            return urllib.unquote(mpd_url).decode('utf8')
    else:
        raise RuntimeError('MPD url not found')


def save_mpd_content(movie_id, mpd_url):
    r = requests.get(mpd_url)

    if r.status_code != 200:
        raise RuntimeError('Error while downloading MPD file')

    f = open(movie_id + '.mpd', 'w')
    f.write(r.content)
    f.close()


def main():
    if len(sys.argv) != 2:
        print 'Usage %s yt_video_url' % sys.argv[0]
        return -1

    movie_url = sys.argv[1]
    movie_id = get_movie_id(movie_url)
    movie_info_content = get_movie_info(movie_id)
    print movie_info_content
    mpd_url = get_mpd_url(movie_info_content)
    print mpd_url
    save_mpd_content(movie_id, mpd_url)


if __name__ == "__main__":
    main()