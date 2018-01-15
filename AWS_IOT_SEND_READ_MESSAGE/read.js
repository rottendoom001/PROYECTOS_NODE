'use strict';

let path = require('path');
let awsIot = require('aws-iot-device-sdk');
let iot_config = require(path.join(__dirname, '/rsc/iot_custtom_config_file.json'));

var device = awsIot.device(iot_config);

device
  .on('connect', function() {
    console.log('connect');
    device.subscribe('topic_1');
  });

  device
  .on('connect', function() {
    console.log('connect');
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
