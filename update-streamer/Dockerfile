FROM python:3.6

WORKDIR "/opt"
ENTRYPOINT ["python", "-m", "remupdates"]

COPY requirements.txt /opt/requirements.txt
RUN pip install -r /opt/requirements.txt
COPY ./remupdates/ /opt/remupdates/
