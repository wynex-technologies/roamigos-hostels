const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'shared', 'page-content.ts');
let content = fs.readFileSync(file, 'utf8');

const contactInterface = `
export interface ContactContent {
  hero: {
    eyebrow: string
    heading: SplitHeading
    copy: string
    status: string
    image: string
  }
  channels: {
    eyebrow: string
    heading: SplitHeading
    copy: string
  }
  form: {
    eyebrow: string
    heading: SplitHeading
    copy: string
    guarantee: string
  }
  visit: {
    eyebrow: string
    heading: SplitHeading
    copy: string
  }
  faq: {
    eyebrow: string
    heading: SplitHeading
  }
  cta: {
    eyebrow: string
    titleLine1: string
    titleSheen: string
    copy: string
    chatPrompt: string
  }
}
`;

content = content.replace(
  'export interface PageContent {',
  contactInterface + '\nexport interface PageContent {\n  contact: ContactContent'
);

const contactDefaults = `
export const CONTACT_DEFAULTS: ContactContent = {
  hero: {
    eyebrow: 'Say hello',
    heading: { line1: 'There is always', lead: 'someone on the ', accent: 'desk', tail: '' },
    copy: 'No ticket numbers, no hold music, no bot that asks for your booking reference three times. Message us and a person who has actually stood at the Nimati Ghat ferry queue will answer you.',
    status: 'Front desk online - usually replies in under 10 minutes',
    image: 'photo-1648960456182-00643d5d20eb'
  },
  channels: {
    eyebrow: 'Four ways in',
    heading: { line1: 'Use whichever one', lead: 'suits the ', accent: 'hour', tail: '' },
    copy: 'All four reach the same desk. WhatsApp is simply the one we answer fastest, at any time of night.'
  },
  form: {
    eyebrow: 'Write to us',
    heading: { line1: 'A form that does not', lead: 'pretend to ', accent: 'send', tail: '' },
    copy: 'Most contact forms drop your message into an inbox nobody has opened since March. This one builds a WhatsApp message and lets you press send - so you know exactly where it went and you have the thread on your own phone.',
    guarantee: 'Nothing you type here is stored or sent anywhere until you press the button. There is no account, no tracking pixel and no third party in between.'
  },
  visit: {
    eyebrow: 'Getting here',
    heading: { line1: 'Airport, station, ISBT -', lead: 'then our ', accent: 'door', tail: '' },
    copy: 'Guwahati is the gateway to the whole Northeast, which means almost everyone arrives from one of three places. Here is what each one costs you in time.'
  },
  faq: {
    eyebrow: 'The questions',
    heading: { line1: 'The six we get', lead: 'asked the ', accent: 'most', tail: '' }
  },
  cta: {
    eyebrow: 'Still deciding?',
    titleLine1: 'You do not need a plan.',
    titleSheen: 'You need a bed for Friday.',
    copy: 'Pick one, message us, and we will work the rest out together once you have dropped your bag.',
    chatPrompt: "Hi Roamigos! I'd like to check availability for my dates."
  }
}
`;

content = content.replace(
  'export const ABOUT_DEFAULTS: AboutContent = {',
  contactDefaults + '\nexport const ABOUT_DEFAULTS: AboutContent = {'
);

fs.writeFileSync(file, content);
