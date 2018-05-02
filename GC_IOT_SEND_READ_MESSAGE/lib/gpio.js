'use strict';
let path = require('path');
let gpio = require('rpi-gpio');

var Lcd = require('lcd');

let pin_arr = [7, 11, 13, 15, 16]

var lcd = new Lcd({
	rs: 26,
	e: 19,
	data: [13, 6, 5, 11],
	cols: 16,
	rows: 2
});

function send_output(pin, value){
	gpio.setup(pin, gpio.DIR_OUT, function (err) {
		gpio.write(pin, value, function(err) {
			if (err) throw err;
			console.log('Written to pin:' + pin + " value:" + value);
		});
	});
}

function send(value) {
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

function send2LCD(value) {
	lcd.setCursor(0, 0);
	lcd.clear();
	lcd.print(value);
}

function readFotoRest(callback) {
	gpio.setup(40, gpio.DIR_IN, function (err) {
		gpio.read(40, function(err, value) {
			if (err) {
				console.error("ERROR LEYENDO PIN" + pin);
				callback(false);
			} else {
				console.log("VALOR LEÍDO :", value);
				callback(value);
			}
		});
	});
}


exports.send = send;
exports.send2LCD = send2LCD;
exports.readFotoRest = readFotoRest;
