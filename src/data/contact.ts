/**
 * Contact page content. Phone, email and the WhatsApp number itself stay in
 * `site.ts` - this file only holds the copy that is unique to the page.
 */

/** Topics offered in the enquiry form; the label is what the owner receives. */
export const enquiryTopics = [
  'Booking a bed or room',
  'Group or hostel takeover',
  'Long stay (14+ nights)',
  'Events, open mic or BBQ',
  'Lost & found',
  'Something else',
] as const

export type EnquiryTopic = (typeof enquiryTopics)[number]

export const contactChannels = [
  {
    key: 'whatsapp',
    title: 'WhatsApp',
    note: 'The fastest way in. Bookings, questions, directions at midnight.',
    action: 'Start a chat',
    meta: 'Usually replies in under 10 minutes',
  },
  {
    key: 'phone',
    title: 'Call the desk',
    note: 'Someone is on the desk 24x7 - a real person, not a queue.',
    action: 'Call now',
    meta: 'Open all day, every day',
  },
  {
    key: 'email',
    title: 'Email',
    note: 'Invoices, long stays, press and anything that needs an attachment.',
    action: 'Write to us',
    meta: 'Answered within one working day',
  },
  {
    key: 'visit',
    title: 'Walk in',
    note: 'No booking? Come by. If a bed is free it is yours tonight.',
    action: 'Get directions',
    meta: 'Reception on the ground floor',
  },
] as const

/** Practical arrival notes - distances are to the hostel door. */
export const reachRoutes = [
  {
    key: 'air',
    title: 'By air',
    place: 'Lokpriya Gopinath Bordoloi International Airport (GAU)',
    distance: '≈ 23 km',
    time: '45-60 min by cab',
    note: 'Prepaid taxis run from the arrivals kerb. Tell us your flight and we will keep the desk expecting you.',
  },
  {
    key: 'rail',
    title: 'By train',
    place: 'Guwahati Railway Station (GHY), Paltan Bazaar',
    distance: '≈ 6 km',
    time: '20 min by auto',
    note: 'Autos are metered-ish - agree the fare at the rank before you get in.',
  },
  {
    key: 'bus',
    title: 'By bus',
    place: 'ISBT Guwahati, Betkuchi',
    distance: '≈ 11 km',
    time: '30 min by cab',
    note: 'Night buses from Shillong, Siliguri and Jorhat all terminate here.',
  },
  {
    key: 'onward',
    title: 'Heading onward',
    place: 'Shillong · Kaziranga · Jorhat for Majuli',
    distance: '100-190 km',
    time: '2.5-4 hrs',
    note: 'We book shared cabs at the desk the night before. Cheaper than the counter, and it picks you up here.',
  },
] as const

export const deskFacts = [
  { label: 'Reception', value: 'Open 24 hours' },
  { label: 'Luggage drop', value: 'Free, before check-in and after check-out' },
  { label: 'Languages', value: 'Assamese, Hindi, Bengali, English' },
  { label: 'Payment', value: 'UPI, cards and cash - at check-in' },
] as const

export const contactFaqs = [
  {
    q: 'How do I actually book - is there a payment page?',
    a: 'There is not, and that is deliberate. Pick a bed on the Rooms page, hit Book Now, and your dates land in our WhatsApp as a message you can read before you send it. We confirm availability, you pay at check-in. No card details, no prepayment, no third-party fee.',
  },
  {
    q: 'Can I check in late, or very early?',
    a: 'Yes. Reception is staffed around the clock, so a 3 am train arrival is fine - just tell us it is coming. Standard check-in is 1:00 PM and check-out is 11:00 AM; early arrivals can drop bags free and use the showers and rooftop while the room is turned around.',
  },
  {
    q: 'Do you take group bookings?',
    a: 'We do - anything from six friends to a whole floor. Message us with your dates and headcount and we will quote a group rate, hold the beds together, and sort out an arrival plan so twelve people are not checking in one at a time.',
  },
  {
    q: 'What is the cancellation policy?',
    a: 'Free cancellation up to 24 hours before check-in. Since nothing is prepaid, cancelling is one message - but do send it, so the bed goes back on the board for someone else.',
  },
  {
    q: 'Can you help plan the rest of the trip?',
    a: 'That is half of what the desk does. Shared cabs to Shillong, the Nimati Ghat ferry for Majuli, Pobitora before lunch, safari slots at Kaziranga - we book them nightly for whoever is going, which usually works out cheaper than arranging it yourself.',
  },
  {
    q: 'Is there an age limit, and are couples allowed?',
    a: 'Guests must be 18 or over to book a dorm bed unless accompanied by a parent. Couples are welcome in private rooms; valid photo ID is required from every guest at check-in, as it is at every property in India.',
  },
] as const
