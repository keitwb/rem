import multiprocessing

user = 'django'
bind = '0.0.0.0:8000'
errorlog = '/logs/django/gunicorn.error.log'
workers = 2 * multiprocessing.cpu_count()
max_requests = 1000
max_requests_jitter = 50
