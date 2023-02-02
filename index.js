const Imap = require('imap')
const simpleParser = require('mailparser').simpleParser
const nodemailer = require('nodemailer')
require('dotenv').config();

const imap = new Imap({
  user: process.env.EMAIL,
  password: process.env.PASSWORD,
  host: process.env.IMAP_HOST,
  port: process.env.IMAP_PORT,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
})

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
})

function random(min, max) {  
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}
  

function checkForEmails() {
  imap.once('ready', function () {
    imap.openBox('INBOX', false, function (err, box) {
      if (err) throw err

      imap.search(['UNSEEN'], function (err, results) {
        if (err) throw err

        let unseenMails
        try {
            unseenMails = imap.fetch(results, {
            bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
            struct: true,
            })
        } catch (err) {
            console.log(err.message)
        }
        // * reading mail
        if (unseenMails) {
            unseenMails.on('message', function (msg, seqno) {
              msg.on('body', async (stream, info) => {
                const mail = await simpleParser(stream)

                const reply = {
                  from: process.env.EMAIL,
                  to: mail.from.text,
                  subject: 'Re: ' + mail.subject,
                  text: 'Thank you for your email.',
                }
                transporter.sendMail(reply, (err, info) => {
                  if (err) throw err;
                    console.log('Reply sent to ' + mail.from.text + '.')
                  })
              })

              //  * Add the "Replies" label to the email
              // Chnage array string to change lable
              imap.addLabels(seqno, ['Replies'], function (err) {
                if (err) console.log(err)
                else console.log('Label added')
              })
              // * setting seen flag
              imap.setFlags(results, ['\\Seen'], (err) => {
                if (err) throw err
                  console.log(`Marked ${results.length} emails as seen.`)
                  imap.end()
              })
            })
            unseenMails.once('error', function (err) {
              console.log('Fetch error: ' + err)
            })
            unseenMails.once('end', function () {
              console.log('Done fetching all messages!')
              imap.end()
            })
        } else {
            imap.end()
        }
      })
    })
  })

  imap.on('error', function (err) {
    console.log(err)
  })

  imap.once('end', function () {
    console.log('Connection ended')
  })

  imap.connect()
}

setInterval(function () {
  try {
      console.log('Server Started')
      checkForEmails()
  } catch (ex) {
    console.log({ ex })
  }
}, random(45000, 120000))