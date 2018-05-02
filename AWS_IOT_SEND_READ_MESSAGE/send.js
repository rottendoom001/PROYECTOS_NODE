'use strict';

let path = require('path');
let awsIot = require('aws-iot-device-sdk');
let iot_config = require(path.join(__dirname, '/rsc/iot_custtom_config_file.json'));
let readline = require('readline');

var device = awsIot.device(iot_config);

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

device
  .on('connect', function() {
    console.log('connect');
    rl.question('¿Que Mensaje desea mandar ? ', (answer) => {
      device.publish('topic_1', JSON.stringify({ message: answer}));
      console.log(`Usted mandó el mensaje : ${answer}`);
      rl.close();
    });
  });
  device
  .on('close', function() {
    console.log('close');
  });
  device
  .on('reconnect', function() {
    console.log('reconnect');
  });
  device
  .on('offline', function() {
    console.log('offline');
  });
  device
  .on('error', function(error) {
    console.log('error', error);
  });
  device
   .on('message', function(topic, payload) {
      console.log('message', topic, payload.toString());
   });

/*




*/
