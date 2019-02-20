FROM python:3.7-slim-stretch as builder

RUN apt update && apt install -y gcc
RUN pip install pipenv==2018.11.26

WORKDIR "/opt"
ENV PIPENV_VENV_IN_PROJECT=1

COPY pycommon/ ./pycommon/
COPY tax-info/Pipfile* ./tax-info/
RUN cd tax-info; pipenv install --deploy
COPY tax-info/remtaxinfo/ ./tax-info/remtaxinfo/

FROM python:3.7-slim-stretch

WORKDIR "/opt/tax-info"
CMD [".venv/bin/python", "-m", "remtaxinfo"]

COPY --from=builder /opt/ /opt/
