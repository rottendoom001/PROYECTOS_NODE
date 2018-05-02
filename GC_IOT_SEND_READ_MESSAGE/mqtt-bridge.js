'use strict';
// [START iot_mqtt_include]
let path = require('path');
let fs = require('fs');
let jwt = require('jsonwebtoken');
let mqtt = require('mqtt');
let iot_config = require(path.join(__dirname, '/rsc/iot_custtom_config_file.json'));
let gp = require(path.join(__dirname, '/lib/gpio.js'));
// [END iot_mqtt_include]

// `projects/${argv.projectId}/locations/${argv.cloudRegion}/registries/${argv.registryId}/devices/${argv.deviceId}`;
let deviceId = iot_config.deviceId;
let projectId = iot_config.projectId;
let cloudRegion = iot_config.cloudRegion;
let registryId = iot_config.registryId;

let mqttClientId = 'projects/' + projectId + '/locations/' + cloudRegion + '/registries/' + registryId + '/devices/' + deviceId;
let mqttTopic = iot_config.mqttTopic;

let pin_values = 0;
let alarm = false;
let instructions = {
  "TURN ON MAX POWER AIR CONDITIONER NULL" : 16,
  "TURN ON LIGHT BATHROOM" : 8,
  "TURN ON LIGHT BEDROOM" : 4,
  "ALARM ON": 2,
  "TURN ON AIR CONDITIONER NULL" : 1,

  "TURN OFF AIR CONDITIONER NULL" : 14, // APAGA LOS 2 01110
  "TURN OFF LIGHT BATHROOM" : 23, // 10111
  "TURN OFF LIGHT BEDROOM" : 27 // 11011
};

function createJwt () {
  const token = {
    'iat': parseInt(Date.now() / 1000),
    'exp': parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
    'aud': projectId
  };
  const privateKey = fs.readFileSync(iot_config.privateKey);
  return jwt.sign(token, privateKey, { algorithm: 'RS256'});
}

let connectionArgs = {
  host: 'mqtt.googleapis.com',
  port: 8883,
  clientId: mqttClientId,
  username: 'unused',
  password: createJwt(),
  protocol: 'mqtts',
  secureProtocol: 'TLSv1_2_method'
};

// Create a client, and connect to the Google MQTT bridge.
let client = mqtt.connect(connectionArgs);

// Subscribe to the /devices/{device-id}/config topic to receive config updates.

client.subscribe('/devices/' + deviceId + '/config');
client.on('connect', (success) => {
  console.log('connect');
  setInterval(() => {
    gp.readFotoRest((result) => {
      if (!result && !alarm) {
        console.log('Alguien se ha metido a tu casa');
        client.publish(mqttTopic, 'ALARM');
      }
    })
  }, 500);
});

client.on('close', () => {
  console.log('close');
});

client.on('error', (err) => {
  console.log('error', err);
});

client.on('message', function (topic, message) {
  // message is Buffer
  console.log ("TOPIC : ", topic);
  console.log("MESSAGE RECEIBED: ", message.toString());
  let number = instructions[message.toString()];
  console.log("ACTUAL VALUE:", parseInt(pin_values, 10).toString(2));
  console.log("INSTRUCTION MASK:", parseInt(number, 10).toString(2));
  if ((message.toString().search(" ON") != -1 )){
    console.log('OR');
    pin_values = number | pin_values;
  } else {
    console.log('AND');
    pin_values = number & pin_values;
  }
  console.log("PIN INT:",pin_values);
  let pin_values_bin = parseInt(pin_values, 10).toString(2);
  console.log("PIN BIN :",pin_values_bin);
  if (message.toString() === 'ALARM ON'){
    pin_values = alarmON(pin_values_bin, pin_values);
  } else {
    gp.send(pin_values_bin);
    gp.send2LCD(pin_values_bin);
  }
});

async function alarmON(pin_values_bin, pin_values){
  console.log("ALARM ON");
  alarm = true;
  gp.send(pin_values_bin);
  var result = await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 4000);
  });
  // APAGAMOS ALARMA
  console.log("ALARM OFF");
  //alarm = false;
  pin_values = 29 & pin_values;
  pin_values_bin = parseInt(pin_values, 10).toString(2);
  console.log("PIN BIN:", pin_values_bin);
  gp.send(pin_values_bin);
  return pin_values;
}
