const mockProvider = require('./mockProvider');
const aligoProvider = require('./aligoProvider');
const twilioProvider = require('./twilioProvider');

function pickSmsProvider() {
  if (process.env.ALIGO_API_KEY) return aligoProvider;
  if (process.env.TWILIO_ACCOUNT_SID) return twilioProvider;
  return mockProvider;
}

function pickVoiceProvider() {
  if (process.env.TWILIO_ACCOUNT_SID) return twilioProvider;
  return mockProvider;
}

module.exports = { pickSmsProvider, pickVoiceProvider };
