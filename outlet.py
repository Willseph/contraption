import os


class Outlet:
	"""Represents a 433 MHz-controlled electrical outlet.
	requires the codesend utility to send 433 MHz codes.

	For more information on codesend, see: https://github.com/ninjablocks/433Utils"""


	def __init__ (self, codeOn, codeOff, pulse = 150):
		if not codeOn:
			raise ValueError ("Missing code for enabling the outlet.")
		if not codeOff:
			raise ValueError ("Missing code for disabling the outlet.")
		self.codeOn = int (codeOn)
		self.codeOff = int (codeOff)
		self.pulse = int (pulse)


	def enable (self):
		"""Sends the "on" code to the outlet."""
		self.sendCode (self.codeOn)


	def disable (self):
		"""Sends the "off" code to the outlet."""
		self.sendCode (self.codeOff)


	def sendCode (self, code):
		"""Sends an arbitrary 433 MHz integer code via the codesend utility."""
		if not code:
			raise ValueError ("Missing code.")
		os.system ("sudo codesend %d -l %d > /dev/null" % (code, self.pulse))
