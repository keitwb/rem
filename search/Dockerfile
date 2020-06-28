FROM python:3.7-slim-stretch as builder

RUN apt update && apt install -y gcc

WORKDIR "/opt"

COPY pycommon/ ./pycommon/
COPY search/requirements.txt ./search/
RUN python -m venv ./search/.venv
RUN cd search && .venv/bin/python -m pip install -r requirements.txt
COPY search/remsearch/ ./search/remsearch/

RUN find ./search/.venv/ -name "*.pyc" -delete &&\
    rm ./search/.venv/lib/python3.7/site-packages/mypyc_*.so

FROM python:3.7-slim-stretch

WORKDIR "/opt/search"
CMD [".venv/bin/python", "-m", "remsearch"]

COPY --from=builder /opt/ /opt/
