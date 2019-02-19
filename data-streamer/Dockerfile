FROM python:3.7-slim-stretch as builder

RUN apt update && apt install -y gcc
RUN pip install pipenv==2018.11.26

WORKDIR "/opt"
ENV PIPENV_VENV_IN_PROJECT=1

COPY pycommon/ ./pycommon/
COPY data-streamer/Pipfile* ./data-streamer/
RUN cd data-streamer; pipenv install --deploy
COPY data-streamer/remdata/ ./data-streamer/remdata/

FROM python:3.7-slim-stretch

WORKDIR "/opt/data-streamer"
CMD [".venv/bin/python", "-m", "remdata"]

COPY --from=builder /opt/ /opt/
