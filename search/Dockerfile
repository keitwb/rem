FROM python:3.7-slim-stretch as builder

RUN apt update && apt install -y gcc
RUN pip install pipenv==2018.11.26

WORKDIR "/opt"
ENV PIPENV_VENV_IN_PROJECT=1

COPY pycommon/ ./pycommon/
COPY search/Pipfile* ./search/
RUN cd search; pipenv install --deploy
COPY search/remsearch/ ./search/remsearch/

FROM python:3.7-slim-stretch

WORKDIR "/opt/search"
CMD [".venv/bin/python", "-m", "remsearch"]

COPY --from=builder /opt/ /opt/
