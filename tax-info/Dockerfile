FROM python:3.7

RUN pip install pipenv==2018.7.1

WORKDIR "/opt"
ENTRYPOINT ["pipenv", "run", "python", "-m", "remtaxinfo"]

COPY pycommon/ /pycommon
COPY tax-info/Pipfile* /opt/
RUN pipenv install
COPY tax-info/remtaxinfo/ /opt/remtaxinfo/
