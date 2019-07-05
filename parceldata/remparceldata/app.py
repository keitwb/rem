import dataclasses
import logging

from sanic import Sanic, response

from .adapter import get_parcel_data_by_pin
from .exceptions import NoFeatureError

logger = logging.getLogger(__name__)

app = Sanic()


@app.route("/v1/parcel/<state>/<county>/<pin_number>", methods=["GET"])
async def parcel_data_handler(_, state, county, pin_number):
    try:
        return response.json(dataclasses.asdict(get_parcel_data_by_pin(county, state, pin_number)))
    except NoFeatureError:
        return response.json({"error": "parcel not found"})
