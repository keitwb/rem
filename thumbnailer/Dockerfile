FROM python:3.8-slim-stretch as builder

ENTRYPOINT ["python", "-m", "remthumbnailer"]
WORKDIR "/opt"

COPY pycommon/ /pycommon
COPY thumbnailer/requirements.txt /opt/
RUN pip install -r requirements.txt

COPY thumbnailer/remthumbnailer/ /opt/remthumbnailer/

