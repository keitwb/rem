"""
Logic that fetches the information from the external government sites and updates the Mongo doc.
"""
import asyncio
import logging
from datetime import datetime
from typing import Any, Dict

from remcommon import fieldnames_gen as fields
from remcommon.log import FieldLogger
from remcommon.models_gen import Property, TaxBill, TaxPropInfo

from .util import adapter
from .util.models import AdapterProtocol

logger = logging.getLogger(__name__)


class Updater:
    mongo_db: Any
    http_session: Any

    def __init__(self, mongo_db, http_session):
        self.mongo_db = mongo_db
        self.http_session = http_session

    async def update_tax_info(self, prop: Property) -> None:
        """
        Update the public tax information for the given property_doc (which should be a Property) by
        fetching it and sticking it in special fields in the property doc.
        """
        if not prop.county:
            logger.info("County is missing for property %s", prop.id)
            return

        if not prop.state:
            logger.info("State is missing for property %s", prop.id)
            return

        try:
            adapter_inst: AdapterProtocol = adapter.get(county=prop.county, state=prop.state)
        except adapter.AdapterNotFoundError:
            logger.warning("No adapter found for %s County, %s", prop.county, prop.state)
            return

        if not prop.pin_numbers:
            return

        tasks = []
        for pin_number in prop.pin_numbers:
            task_logger = FieldLogger(
                logger, {"county": prop.county, "state": prop.state, "property_id": prop.id}
            )

            tasks.append(self.update_with_adapter(prop.id, pin_number, adapter_inst, task_logger))

        for res in await asyncio.gather(*tasks, return_exceptions=True):
            if isinstance(res, Exception):
                logger.error("Error in task", exc_info=res)

    async def update_with_adapter(self, property_id, pin, adapter_inst, task_logger):
        """
        Do the fetch with the given adapter
        """
        current_year = datetime.now().year

        async def update_property(update_obj: Dict):
            await self.mongo_db.properties.update_one({"_id": property_id}, update_obj)

        async def update_pin_property_info(pin, task_logger):
            """
            Gets the latest property info from the external site and updates it in the property doc.
            """
            try:
                prop_info = await adapter_inst.get_latest_property_info(pin, self.http_session)
                await update_property(
                    {"$set": {f"{fields.PROPERTY_TAX_PROP_INFO}.{pin}": TaxPropInfo.to_dict(prop_info)}}
                )
                task_logger.info("Property info updated for pin %s", pin)
            except Exception as e:
                task_logger.error("Error in task", exc_info=e)
                await update_property({"$set": {f"{fields.PROPERTY_TAX_PROP_INFO}.{pin}.error": repr(e)}})
                raise

        async def update_pin_tax_bills_for_year(pin, year, task_logger):
            """
            Gets the tax bill for the given year and puts it into the property doc
            """
            try:
                tax_bill = await adapter_inst.get_tax_bill(pin, year, self.http_session)
                await update_property(
                    {"$set": {f"{fields.PROPERTY_TAX_BILLS}.{pin}.{year}": TaxBill.to_dict(tax_bill)}}
                )
                task_logger.info("Tax bill updated")
            except Exception as e:
                task_logger.error("Error in task", exc_info=e)
                await update_property({"$set": {f"{fields.PROPERTY_TAX_BILLS}.{pin}.{year}.error": repr(e)}})
                raise

        tasks = []

        tasks.append(update_pin_property_info(pin, task_logger))

        for year in [current_year - 2, current_year - 1, current_year]:
            tasks.append(update_pin_tax_bills_for_year(pin, year, task_logger.copy(year=year)))

        for res in await asyncio.gather(*tasks, return_exceptions=True):
            if isinstance(res, Exception):
                task_logger.error("Error in task", exc_info=res)

        task_logger.info("Finished update")

    async def remove_stale_pin_info(self, prop: Property):
        """
        Take out property information for pins that are no longer associated with the property
        """
        for pin in set((prop.tax_prop_info or {}).keys()) | set((prop.tax_bills or {}).keys()):
            if pin not in (prop.pin_numbers or []):
                await self.mongo_db.properties.update_one(
                    {"_id": prop.id},
                    {
                        "$unset": {
                            f"{fields.PROPERTY_TAX_PROP_INFO}.{pin}": "",
                            f"{fields.PROPERTY_TAX_BILLS}.{pin}": "",
                        }
                    },
                )
                logger.info("Removed stale pin: %s", pin)
