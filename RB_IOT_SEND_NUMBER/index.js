'use strict';
let path = require('path');
let gpio = require('rpi-gpio');

let awsIot = require('aws-iot-device-sdk');
let iot_config = require(path.join(__dirname, './rsc/iot_custtom_config_file.json'));

let pin_arr = [7, 11, 13, 15]

function send_output(pin, value){
	gpio.setup(pin, gpio.DIR_OUT, function (err) {
		gpio.write(pin, value, function(err) {
			if (err) throw err;
			console.log('Written to pin:' + pin + " value:" + value);
		});
	});
}

function send(value) {
	value = parseInt(value, 10).toString(2);
	//console.log(value);
	while ((value.length - pin_arr.length) < 0){
		value = '0' + value;
	}
	console.log(value);
	for (var i = 0; i < value.length; i++){
		var pin = pin_arr[i];
		var out = value[i];
		out = (out === '1')? true : false;
		//console.log("pin:", pin);
		//console.log("out:", out);
		send_output(pin, out)

	}	
}


var device = awsIot.device(iot_config);

device.on('connect', function() {
	console.log('connect');
	device.subscribe('topic_1');
});
device.on('connect', function() {
	console.log('connect');
});
device.on('close', function() {
	console.log('close');
});
device.on('reconnect', function() {
	console.log('reconnect');
});
device.on('offline', function() {
	console.log('offline');
});
device.on('error', function(error) {
	console.log('error', error);
});
device.on('message', function(topic, payload) {
	var payload = payload.toString();
	payload = JSON.parse(payload); 
	console.log('message', topic, payload.message);
	if (!isNaN(payload.message)){
		send(payload.message);
	};
});




