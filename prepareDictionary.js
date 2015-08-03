// prepareDictionary.js removes all /and upercase caracters from each word in en_US.dic
//([a-z])\w+(?:[^/\W])

fs = require('fs');
fs.readFile('./en_US.dic', 'utf8', function (err, data) {
	// console log fs error
	if (err) {
		return console.log("fs error",err);
	}
	data = data.split('\n');

	//regex each word
	var regEx = /(\b[a-z]\w+)/;

	var wordlist = [];
	data.forEach(function(word){
		if ( word.match(regEx) ) {
			// wordlist.push(word)
			console.log(regEx.exec(word)[0]);
		}
	});

});

