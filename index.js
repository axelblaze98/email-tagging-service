const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;
const nodemailer = require('nodemailer');

// Generate a password from https://security.google.com/settings/security/apppasswords and use that password instead.
const imap = new Imap({
  user: 'paarthbhandaritest123@gmail.com',
  password: 'jvablsnpnbmzbpsc',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'paarthbhandaritest123@gmail.com',
    pass: 'jvablsnpnbmzbpsc',
  },
});

function checkForEmails() {
  imap.once('ready', function () {
    imap.openBox('INBOX', false, function (err, box) {
      if (err) throw err;

      // *  const searchCriteria = ['UNSEEN', ['SINCE', 'January 1st, 2023']];

      imap.search(['UNSEEN'], function (err, results) {
        if (err) throw err;

        var f = imap.fetch(results, {
          bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
          struct: true,
        });
        // * reading mail
        f.on('message', function (msg, seqno) {
          // console.log('Message #%d', seqno);
          // var prefix = '(#' + seqno + ') ';

          // * send reply
          msg.on('body', async (stream, info) => {
            const mail = await simpleParser(stream);

            const reply = {
              from: 'paarthbhandaritest123@gmail.com',
              to: mail.from.text,
              subject: 'Re: ' + mail.subject,
              text: 'Thank you for your email.',
            };
            transporter.sendMail(reply, (err, info) => {
              if (err) throw err;
              console.log('Reply sent to ' + mail.from.text + '.');
            });
          });

          // msg.on('body', function (stream, info) {
          //   console.log(prefix + 'Body');
          //   stream.pipe(process.stdout);
          // });
          // msg.once('attributes', function (attrs) {
          //   console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
          // });
          // msg.once('end', function () {
          //   console.log(prefix + 'Finished');
          // });

          //  * Add the "Replies" label to the email
          imap.addLabels(seqno, ['Replies'], function (err) {
            if (err) console.log(err);
            else console.log('Label added');
          });
          // * setting seen flag
          imap.setFlags(results, ['\\Seen'], (err) => {
            if (err) throw err;
            console.log(`Marked ${results.length} emails as seen.`);
            imap.end();
          });
        });
        f.once('error', function (err) {
          console.log('Fetch error: ' + err);
        });
        f.once('end', function () {
          console.log('Done fetching all messages!');
          imap.end();
        });
      });
    });
  });

  imap.once('error', function (err) {
    console.log(err);
  });

  imap.once('end', function () {
    console.log('Connection ended');
  });

  imap.connect();
}

// setInterval(checkForEmails, 60000);
checkForEmails();