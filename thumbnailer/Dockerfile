FROM python:3.7-slim-stretch as builder

RUN apt update && apt install -y gcc
RUN pip install pipenv==2018.11.26

WORKDIR "/opt"
ENV PIPENV_VENV_IN_PROJECT=1

COPY pycommon/ /pycommon
COPY thumbnailer/Pipfile* /opt/
RUN pipenv install --deploy
COPY thumbnailer/remthumbnailer/ /opt/remthumbnailer/

FROM python:3.7-slim-stretch

WORKDIR "/opt"
ENTRYPOINT [".venv/bin/python", "-m", "remthumbnailer"]

COPY --from=builder /opt/ /opt/
