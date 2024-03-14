// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
const { sendEmailNotification } = require('./emailSender');
const { getNextTask, getDiffToStartDate } = require('./reminders.js');

const APP_NAME = "Template Seven";
const messages = {
  NOTIFY_MISSING_PERMISSIONS: 'Please enable profile permissions in the Amazon Alexa app.',
  ERROR: 'Uh Oh. Looks like something went wrong.'
};

const FULL_NAME_PERMISSION = "alexa::profile:name:read";
const EMAIL_PERMISSION = "alexa::profile:email:read";
const MOBILE_PERMISSION = "alexa::profile:mobile_number:read";


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = "Welcome! This skill will collect your personal information. If you're curious about what kind of data might be collected, please say I want to know. Or, if you prefer to skip this for now, you can simply say I don't want to know. Remember, feel free to ask me anytime by saying tell me what data is collected";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const WantKnowIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'WantknowIntent';
    },
    handle(handlerInput) {
    const speakOutput = 'This skill will collect your name during the conversation. Also, this skill will seek your email and name permissions. Please say yes to continue or no to exit.';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
    }
}

const DataCollectionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'DataCollectionIntent';
    },
    handle(handlerInput) {
    const speakOutput = 'This skill will collect your name during the conversation. Also, this skill will seek your email and name permissions. Please respond to any pending questions to continue, or say no if you wish to end the session.';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
    }
}


const NoExitIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'NoExitIntent';
    },
    handle(handlerInput) {
    const speakOutput = 'Thank you! Goodbye.';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
    }
}
const YesContinueIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'YesContinueIntent';
    },
    async handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        const userName = sessionAttributes.hasOwnProperty('name') ? sessionAttributes.name : "";

        const speakOutput = 'Hello! Welcome to Amazon Intern Helper. What is your name?';
            
        const repromptText = 'I\'m excited to hear that you\'ll be starting at Amazon. When is your start date?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .getResponse();
        
    }
};

const CaptureUserNameHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CaptureUserNameIntent';
    },
    async handle(handlerInput) {
        const userName = handlerInput.requestEnvelope.request.intent.slots.name.value;
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        
        sessionAttributes.name = userName;
        attributesManager.setPersistentAttributes(sessionAttributes);
        await attributesManager.savePersistentAttributes(); 

        const date = sessionAttributes.hasOwnProperty('startDate') ? sessionAttributes.startDate : 0;
        let speakOutput; 
        speakOutput = `Thanks ${userName}, when is your start date?`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('When is your start date?')
            .getResponse();
    }
};

const CaptureStartDateIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CaptureStartDateIntent';
    },
    async handle(handlerInput) {
        const year = handlerInput.requestEnvelope.request.intent.slots.year.value;
        const month = handlerInput.requestEnvelope.request.intent.slots.month.value;
        const day = handlerInput.requestEnvelope.request.intent.slots.day.value;
        
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        const userName = sessionAttributes.hasOwnProperty('name') ? sessionAttributes.name : "";
        
        const startDateAttributes = {
            "year": year,
            "month": month,
            "day": day   
        };
        sessionAttributes.startDate = startDateAttributes;
        
        attributesManager.setPersistentAttributes(sessionAttributes);
        await attributesManager.savePersistentAttributes();    
        
        
        const speakOutput = `Thanks ${userName}, I'll remember that you will start on ${month} ${day} ${year}.`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speakOutput = `Sorry, I couldn't understand what you said. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const LoadStorageInterceptor = {
    async process(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = await attributesManager.getPersistentAttributes() || {};
        const name = sessionAttributes.hasOwnProperty('name') ? sessionAttributes.name : "";
        const date = sessionAttributes.hasOwnProperty('startDate') ? sessionAttributes.startDate : {};

        if (name || date) {
            attributesManager.setSessionAttributes(sessionAttributes);
        }
    }
}

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
    )
    .addRequestHandlers(
    NoExitIntentHandler,
    YesContinueIntentHandler,
    WantKnowIntentHandler,
    DataCollectionIntentHandler,        
    LaunchRequestHandler,
    CaptureUserNameHandler,
    CaptureStartDateIntentHandler,
       ) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(
        LoadStorageInterceptor
    )
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();