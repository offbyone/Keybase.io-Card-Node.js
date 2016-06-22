//Execute script.js
var fs = require('fs');
eval(fs.readFileSync('script.js')+'');


//Call the function
generate_keybase_card('online', 'clean', callback_func);

//This is the callback
function callback_func(data, error) {

	//Check for an error
	if (!error) {

		//Write the image to the disk named "card.png"
		fs = require('fs');
		fs.writeFile('card.png', data, 'binary');

		console.log('Works, check for card.png in this directory');
	} else {

		//Log the error on the command line
		console.log('There was an error;\n'+error);
	}
}