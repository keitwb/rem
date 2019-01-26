FROM python:3.7

RUN pip install pipenv==2018.7.1

WORKDIR "/opt"
ENTRYPOINT ["pipenv", "run", "python", "-m", "remdata"]

COPY pycommon/ /pycommon
COPY data-streamer/Pipfile* /opt/
RUN pipenv install
COPY data-streamer/remdata/ /opt/remdata/
