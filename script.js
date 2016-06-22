/*
 *	Username: Username on Keybase.io
 *	Theme: (optional) Default, Dark, & Clean
 *	Callback: Function to call when generation is complete
 */
function generate_keybase_card(username, theme, callback) {

	//Require request
	var request = require('request');

	//Get the api data
	request('https://keybase.io/_/api/1.0/user/lookup.json?usernames=' + username, function(error, response, body) {
		if (!error && response.statusCode == 200) {

			//Check if the user exists
			if ((JSON.parse(body)).them[0] === null) {
				callback("ERROR: User does not exist", 1);
			}
			//Parse the response
			var parsedResponse = JSON.parse(body);

			//Get the profile URL, download the data
			var profile_pic_url = (parsedResponse).them[0].pictures.primary.url;
			request({
				url: profile_pic_url,
				//Make the returned body a Buffer
				encoding: null
			}, function(error, response, profile_pic_data) {

				if (!error && response.statusCode == 200) {

					//Get the fingerprint and add spaces to it
					var fingerprint_full = parsedResponse.them[0].public_keys.primary.key_fingerprint;
					var fngr_prnt_ns = ((fingerprint_full.substr(-16)).toUpperCase());
					var fingerprint_64bit = fngr_prnt_ns.slice(0, 4) + " " + fngr_prnt_ns.slice(4, 8) + " " + fngr_prnt_ns.slice(8, 12) + " " + fngr_prnt_ns.slice(12, 16);

					//Get the number of devices
					var number_devices = (Object.keys(parsedResponse.them[0].devices).length).toString();

					//Get proofs of external services
					var proofs_object = parsedResponse.them[0].proofs_summary.by_proof_type;
					var twitter_proof = proofs_object.hasOwnProperty('twitter');
					var github_proof = proofs_object.hasOwnProperty('github');
					var reddit_proof = proofs_object.hasOwnProperty('reddit');
					var coinbase_proof = proofs_object.hasOwnProperty('coinbase');
					var hackernews_proof = proofs_object.hasOwnProperty('hackernews');
					var website_proof = proofs_object.hasOwnProperty('dns');

					//Check for a bitcoin address
					var bitcoin_aviable = parsedResponse.them[0].cryptocurrency_addresses.hasOwnProperty('bitcoin');

					//Require GD (kind of needed)
					var gd = require('node-gd');

					//Use true color so images don't look like crap
					var img = gd.createTrueColorSync(420, 116);

					//Themes, always needed
					switch (theme) {
						case 'clean':
							//This one's transparent:)
							img.alphaBlending(0);
							img.saveAlpha(1);
							img.filledRectangle(0, 0, 420, 116, img.colorAllocateAlpha(255, 255, 255, 127));
							img.alphaBlending(1);
							break;
						case 'dark':
							img.filledRectangle(0, 0, 420, 116, gd.trueColor(0, 0, 0));
							break;
						default:
							theme = "default";
							img.filledRectangle(0, 0, 420, 116, gd.trueColor(238, 238, 238));
							break;
					}

					//Create some colors
					var black = gd.trueColor(0, 0, 0);
					var white = gd.trueColor(255, 255, 255);
					var blue = gd.trueColor(51, 160, 255);
					var orange = gd.trueColor(255, 111, 33);
					var silver = gd.trueColor(192, 192, 192);

					//Check to see if the profile pic is a png or jpeg (and then load it)
					var user_avatar;
					if (((profile_pic_url.substr(profile_pic_url.length - 3)) == 'png')) {
						user_avatar = gd.createFromPngPtr(profile_pic_data);
					} else {
						user_avatar = gd.createFromJpegPtr(profile_pic_data);
					}

					//Resize and copy it on the image
					user_avatar.copyResampled(img, 8, 8, 0, 0, 100, 100, 360, 360);

					//If a username is long, change the look of the card
					if (username.length < 12) {
						//add "keybase.io/""
						if (theme == 'dark') {
							img.stringFT(white, 'assets/fonts/Lato-Regular.ttf', 21, 0, 114, 36, 'keybase.io/');
						} else {
							img.stringFT(black, 'assets/fonts/Lato-Regular.ttf', 21, 0, 114, 36, 'keybase.io/');
						}
						//now add the username
						img.stringFT(orange, 'assets/fonts/Lato-Bold.ttf', 21, 0, 256, 36, username);

					} else {
						//add "keybase.io/""
						if (theme == 'dark') {
							img.stringFT(white, 'assets/fonts/Lato-Regular.ttf', 19, 0, 114, 32, 'keybase.io/');
						} else {
							img.stringFT(black, 'assets/fonts/Lato-Regular.ttf', 19, 0, 114, 32, 'keybase.io/');
						}
						//now add the username
						img.stringFT(orange, 'assets/fonts/Lato-Bold.ttf', 18, 0, 240, 32, username);
					}

					//now add the 64 bit fingerprint
					img.stringFT(blue, 'assets/fonts/Lato-Regular.ttf', 18, 0, 140, 66, fingerprint_64bit);

					//add the key before the fingerprint
					var key_icon;
					if (theme == 'dark') {
						key_icon = gd.createFromPng('assets/icons/dark/key-icon.png');
					} else {
						key_icon = gd.createFromPng('assets/icons/default/vintage-key-outline.png');
					}
					key_icon.copyResampled(img, 114, 48, 0, 0, 20, 20, 50, 50);

					//set initial x position, increase by 15
					var proof_x_position = 114;

					//add # of devices w/ icon (if there are any)
					if (number_devices != '0') {
						var device_icon;
						if (theme == 'dark') {
							img.stringFT(white, 'assets/fonts/Lato-Regular.ttf', 20, 0, 114, 100, number_devices);
							device_icon = gd.createFromPng('assets/icons/dark/mobile-icon.png');
						} else {
							img.stringFT(black, 'assets/fonts/Lato-Regular.ttf', 20, 0, 114, 100, number_devices);
							device_icon = gd.createFromPng('assets/icons/default/mobile-phone.png');
						}

						if (number_devices <= 9) {
							device_icon.copyResampled(img, 130, 80, 0, 0, 20, 20, 50, 50);
							proof_x_position = 160;
						} else {
							device_icon.copyResampled(img, 150, 80, 0, 0, 20, 20, 50, 50);
							proof_x_position = 175;
						}

					}

					//add twitter
					if (twitter_proof) {
						var twitter_icon = gd.createFromPng('assets/icons/default/rsz_twitter-black-shape.png');
						twitter_icon.copyResampled(img, proof_x_position, 80, 0, 0, 20, 20, 50, 50);
						proof_x_position = proof_x_position + 30;
					}

					//add github
					if (github_proof) {
						var github_icon;
						if (theme == 'dark') {
							github_icon = gd.createFromPng('assets/icons/dark/github-icon.png');
						} else {
							github_icon = gd.createFromPng('assets/icons/default/github-logo.png');
						}
						github_icon.copyResampled(img, proof_x_position, 80, 0, 0, 20, 20, 50, 50);
						proof_x_position = proof_x_position + 30;
					}

					//add reddit
					if (reddit_proof) {
						var reddit_icon = gd.createFromPng('assets/icons/default/reddit-big-logo.png');
						reddit_icon.copyResampled(img, proof_x_position, 80, 0, 0, 20, 20, 50, 50);
						proof_x_position = proof_x_position + 30;
					}

					//add coinbase
					if (coinbase_proof) {
						var coinbase_icon = gd.createFromPng('assets/icons/default/coinbase.png');
						coinbase_icon.copyResampled(img, proof_x_position, 80, 0, 0, 20, 20, 50, 50);
						proof_x_position = proof_x_position + 30;
					}

					//add hacker news
					if (hackernews_proof) {
						var hacker_news_icon = gd.createFromPng('assets/icons/default/hacker-news.png');
						hacker_news_icon.copyResampled(img, proof_x_position, 80, 0, 0, 20, 20, 50, 50);
						proof_x_position = proof_x_position + 30;
					}

					//add globe (websites)
					if (website_proof) {
						var globe_icon = gd.createFromPng('assets/icons/default/globe.png');
						globe_icon.copyResampled(img, proof_x_position, 80, 0, 0, 20, 20, 50, 50);
						proof_x_position = proof_x_position + 30;
					}

					//add bitcoin
					if (bitcoin_aviable) {
						var bitcoin_icon = gd.createFromPng('assets/icons/default/bitcoin.png');
						bitcoin_icon.copyResampled(img, proof_x_position, 80, 0, 0, 20, 20, 50, 50);
						proof_x_position = proof_x_position + 30;
					}

					//Add a border for the default theme
					if (theme == 'default') {
						img.rectangle(0, 0, 419, 115, silver);
						img.rectangle(1, 1, 418, 114, silver);
					}

					//Save the image in another variable
					var mainReturn = img.pngPtr();

					//Destroy the image for more memory
					img.destroy();

					//Send the PNG in binary to the callback
					callback(mainReturn);

				} else {
					callback('ERROR: Request error status code: ' + response.statusCode, 2);
				}
			});

		} else {
			callback('ERROR: Request error status code: ' + response.statusCode, 2);
		}
	});
}