require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const meetupApi = require('meetup-api')({ key: process.env.MEETUP_API_KEY || '' });
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 5000;

if (!process.env.MEETUP_API_KEY) {
  console.error('ERROR: no meetup API key supplied in .env - all of your requests will fail');
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/getNextEvent', (req, res, next) => {
  if(!process.env.MEETUP_NAME) {
    res.status(500).json({ error: 'No meetup URL name specified in .env' });
    return;
  }

  meetupApi.getGroup({ urlname: process.env.MEETUP_NAME || '' }, (err, resp) => {
    if (resp && resp.next_event) {
      res.send({
        group: resp.name,
        ...resp.next_event
      });
    } else {
      res.status(500).json({ error: 'Could not get next event data' });
    }
  });
});

app.get('/api/getEventAttendees/:eventId', (req, res) => {
  meetupApi.getRSVPs({ event_id: req.params.eventId }, (err, resp) => {
    if (resp) {
      const attendees = resp.results
      .filter(attendee => attendee.response === 'yes' || attendee.response === 'waitlist')
      .map((attendee) => ({
        id: attendee.member.member_id.toString(),
        name: attendee.member.name,
        avatar: attendee.member_photo ? attendee.member_photo.thumb_link : null,
        arrived: false,
      }));
      res.send(attendees);
    } else {
      res.status(500).json({ error: 'Could not get event attendees data' });
    }
  });
});

app.post('/api/sendEmailEventAttendees', function (req, res) {
  if(!process.env.MEETUP_EMAIL || !process.env.MEETUP_EMAIL_PASS) {
    res.status(500).json({ error: 'No email specified in .env' });
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      user: process.env.MEETUP_EMAIL,
      pass: process.env.MEETUP_EMAIL_PASS,
    }
  });
  const mailOptions = {
    from: process.env.MEETUP_EMAIL,
    to: req.body.emailRecipient,
    subject: `Guestlist for ${req.body.currentEvent}`,
    text: req.body.arrivedAttendees.join(','),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.send(`Email sent to ${req.body.emailRecipient}`);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
