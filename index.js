'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.get('/', function(req, res) {
	res.send("Welcome to my chatbot")
})

let token = ""

app.listen(app.get('port'), function() {
	console.log("running: port")
})

app.get('/webhook/', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === "demochat") {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.post('/webhook/', function(req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			decideMessage(sender,text)
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			decideMessage(sender, text)
			continue
		}
	}
	res.sendStatus(200)
})

function decideMessage(sender, text1){
	let text = text1.toLowerCase()
	if (text.includes("hello") || text.includes("hi")) {
		sendText(sender, "Welcome to My Chat !! Where do you stay?")
	} else if (text.includes("berlin")) {
		sendText(sender, "Welcome to Berlin")
		sendImageMessage(sender, "http://wikitravel.org/upload/en/thumb/2/2b/Berlin_Brandenburger_Tor_Abend.jpg/510px-Berlin_Brandenburger_Tor_Abend.jpg")

	} else if (text.includes("london")) {
		sendText(sender, "Welcome to London") 
		sendImageMessage(sender, "http://littleatoms.com/sites/default/files/styles/imagedetail/public/post/image/london.png")

	} else if (text.includes("business")) {
		sendGenericMessage(sender)
	} else {
		sendText(sender, "I am in Berlin")
		sendButtonMessage(sender, "Choose your assistance provider?")
	}

}

function sendText(sender, text) {
	let messageData = {text: text}
	sendRequest(sender, messageData)
}

function sendRequest(sender, messageData){
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message : messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("response body error")
		}
	})
}

function sendGenericMessage(sender){
	let messageData = {
		"attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Business",
            "image_url":"http://bilmoore.com/wp-content/uploads/2011/11/network-marketing-business-plan.jpg",
            "subtitle":"Whats is your plan ?",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://en.wikipedia.org/wiki/Business_plan",
                "title":"More about business plan"
              }            
            ]      
          }
        ]
      }
  	}
	}
	sendRequest(sender, messageData)
}

function sendImageMessage (sender, imageURL){
	let messageData = {
	  "attachment":{
      "type":"image",
      "payload":{
        "url": imageURL
      }
    }
	}
	sendRequest(sender, messageData)
}