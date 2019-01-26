FROM python:3.7

RUN pip install pipenv==2018.7.1

WORKDIR "/opt"
ENTRYPOINT ["pipenv", "run", "python", "-m", "remsearch"]

COPY pycommon/ /pycommon
COPY search/Pipfile* /opt/
RUN pipenv install
COPY search/remsearch/ /opt/remsearch/
