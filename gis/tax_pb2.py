# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: tax.proto

import sys
_b=sys.version_info[0]<3 and (lambda x:x) or (lambda x:x.encode('latin1'))
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor.FileDescriptor(
  name='tax.proto',
  package='tax',
  syntax='proto3',
  serialized_pb=_b('\n\ttax.proto\x12\x03tax\"y\n\x10ParcelTaxRequest\x12\x12\n\npin_number\x18\x01 \x01(\t\x12\x0e\n\x06\x63ounty\x18\x02 \x01(\t\x12\r\n\x05state\x18\x03 \x01(\t\x12\x19\n\x11starting_tax_year\x18\x04 \x01(\x05\x12\x17\n\x0f\x65nding_tax_year\x18\x05 \x01(\x05\"\x8b\x01\n\x0eParcelTaxBills\x12\x34\n\ttax_bills\x18\x01 \x03(\x0b\x32!.tax.ParcelTaxBills.TaxBillsEntry\x1a\x43\n\rTaxBillsEntry\x12\x0b\n\x03key\x18\x01 \x01(\x05\x12!\n\x05value\x18\x02 \x01(\x0b\x32\x12.tax.ParcelTaxBill:\x02\x38\x01\"\xb9\x01\n\rParcelTaxBill\x12\x12\n\npin_number\x18\x01 \x01(\t\x12\x10\n\x08tax_year\x18\x02 \x01(\x05\x12\x12\n\nowner_name\x18\x03 \x01(\t\x12\x1b\n\x13taxable_value_cents\x18\x04 \x01(\x05\x12\x17\n\x0ftotal_due_cents\x18\x05 \x01(\x05\x12\x18\n\x10total_paid_cents\x18\x06 \x01(\x05\x12\x1e\n\x08payments\x18\x07 \x03(\x0b\x32\x0c.tax.Payment\"-\n\x07Payment\x12\x0c\n\x04\x64\x61te\x18\x01 \x01(\t\x12\x14\n\x0c\x61mount_cents\x18\x02 \x01(\x05\x32\x46\n\x07TaxInfo\x12;\n\x0bGetTaxBills\x12\x15.tax.ParcelTaxRequest\x1a\x13.tax.ParcelTaxBills\"\x00\x62\x06proto3')
)




_PARCELTAXREQUEST = _descriptor.Descriptor(
  name='ParcelTaxRequest',
  full_name='tax.ParcelTaxRequest',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='pin_number', full_name='tax.ParcelTaxRequest.pin_number', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='county', full_name='tax.ParcelTaxRequest.county', index=1,
      number=2, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='state', full_name='tax.ParcelTaxRequest.state', index=2,
      number=3, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='starting_tax_year', full_name='tax.ParcelTaxRequest.starting_tax_year', index=3,
      number=4, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='ending_tax_year', full_name='tax.ParcelTaxRequest.ending_tax_year', index=4,
      number=5, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=18,
  serialized_end=139,
)


_PARCELTAXBILLS_TAXBILLSENTRY = _descriptor.Descriptor(
  name='TaxBillsEntry',
  full_name='tax.ParcelTaxBills.TaxBillsEntry',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='key', full_name='tax.ParcelTaxBills.TaxBillsEntry.key', index=0,
      number=1, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='value', full_name='tax.ParcelTaxBills.TaxBillsEntry.value', index=1,
      number=2, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=_descriptor._ParseOptions(descriptor_pb2.MessageOptions(), _b('8\001')),
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=214,
  serialized_end=281,
)

_PARCELTAXBILLS = _descriptor.Descriptor(
  name='ParcelTaxBills',
  full_name='tax.ParcelTaxBills',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='tax_bills', full_name='tax.ParcelTaxBills.tax_bills', index=0,
      number=1, type=11, cpp_type=10, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[_PARCELTAXBILLS_TAXBILLSENTRY, ],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=142,
  serialized_end=281,
)


_PARCELTAXBILL = _descriptor.Descriptor(
  name='ParcelTaxBill',
  full_name='tax.ParcelTaxBill',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='pin_number', full_name='tax.ParcelTaxBill.pin_number', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='tax_year', full_name='tax.ParcelTaxBill.tax_year', index=1,
      number=2, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='owner_name', full_name='tax.ParcelTaxBill.owner_name', index=2,
      number=3, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='taxable_value_cents', full_name='tax.ParcelTaxBill.taxable_value_cents', index=3,
      number=4, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='total_due_cents', full_name='tax.ParcelTaxBill.total_due_cents', index=4,
      number=5, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='total_paid_cents', full_name='tax.ParcelTaxBill.total_paid_cents', index=5,
      number=6, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='payments', full_name='tax.ParcelTaxBill.payments', index=6,
      number=7, type=11, cpp_type=10, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=284,
  serialized_end=469,
)


_PAYMENT = _descriptor.Descriptor(
  name='Payment',
  full_name='tax.Payment',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='date', full_name='tax.Payment.date', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='amount_cents', full_name='tax.Payment.amount_cents', index=1,
      number=2, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=471,
  serialized_end=516,
)

_PARCELTAXBILLS_TAXBILLSENTRY.fields_by_name['value'].message_type = _PARCELTAXBILL
_PARCELTAXBILLS_TAXBILLSENTRY.containing_type = _PARCELTAXBILLS
_PARCELTAXBILLS.fields_by_name['tax_bills'].message_type = _PARCELTAXBILLS_TAXBILLSENTRY
_PARCELTAXBILL.fields_by_name['payments'].message_type = _PAYMENT
DESCRIPTOR.message_types_by_name['ParcelTaxRequest'] = _PARCELTAXREQUEST
DESCRIPTOR.message_types_by_name['ParcelTaxBills'] = _PARCELTAXBILLS
DESCRIPTOR.message_types_by_name['ParcelTaxBill'] = _PARCELTAXBILL
DESCRIPTOR.message_types_by_name['Payment'] = _PAYMENT
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

ParcelTaxRequest = _reflection.GeneratedProtocolMessageType('ParcelTaxRequest', (_message.Message,), dict(
  DESCRIPTOR = _PARCELTAXREQUEST,
  __module__ = 'tax_pb2'
  # @@protoc_insertion_point(class_scope:tax.ParcelTaxRequest)
  ))
_sym_db.RegisterMessage(ParcelTaxRequest)

ParcelTaxBills = _reflection.GeneratedProtocolMessageType('ParcelTaxBills', (_message.Message,), dict(

  TaxBillsEntry = _reflection.GeneratedProtocolMessageType('TaxBillsEntry', (_message.Message,), dict(
    DESCRIPTOR = _PARCELTAXBILLS_TAXBILLSENTRY,
    __module__ = 'tax_pb2'
    # @@protoc_insertion_point(class_scope:tax.ParcelTaxBills.TaxBillsEntry)
    ))
  ,
  DESCRIPTOR = _PARCELTAXBILLS,
  __module__ = 'tax_pb2'
  # @@protoc_insertion_point(class_scope:tax.ParcelTaxBills)
  ))
_sym_db.RegisterMessage(ParcelTaxBills)
_sym_db.RegisterMessage(ParcelTaxBills.TaxBillsEntry)

ParcelTaxBill = _reflection.GeneratedProtocolMessageType('ParcelTaxBill', (_message.Message,), dict(
  DESCRIPTOR = _PARCELTAXBILL,
  __module__ = 'tax_pb2'
  # @@protoc_insertion_point(class_scope:tax.ParcelTaxBill)
  ))
_sym_db.RegisterMessage(ParcelTaxBill)

Payment = _reflection.GeneratedProtocolMessageType('Payment', (_message.Message,), dict(
  DESCRIPTOR = _PAYMENT,
  __module__ = 'tax_pb2'
  # @@protoc_insertion_point(class_scope:tax.Payment)
  ))
_sym_db.RegisterMessage(Payment)


_PARCELTAXBILLS_TAXBILLSENTRY.has_options = True
_PARCELTAXBILLS_TAXBILLSENTRY._options = _descriptor._ParseOptions(descriptor_pb2.MessageOptions(), _b('8\001'))

_TAXINFO = _descriptor.ServiceDescriptor(
  name='TaxInfo',
  full_name='tax.TaxInfo',
  file=DESCRIPTOR,
  index=0,
  options=None,
  serialized_start=518,
  serialized_end=588,
  methods=[
  _descriptor.MethodDescriptor(
    name='GetTaxBills',
    full_name='tax.TaxInfo.GetTaxBills',
    index=0,
    containing_service=None,
    input_type=_PARCELTAXREQUEST,
    output_type=_PARCELTAXBILLS,
    options=None,
  ),
])
_sym_db.RegisterServiceDescriptor(_TAXINFO)

DESCRIPTOR.services_by_name['TaxInfo'] = _TAXINFO

# @@protoc_insertion_point(module_scope)