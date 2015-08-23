// An anagram of the phrase is: "poultry outwits ants"
// The MD5 hash of the secret phrase is "4624d200580677270a54ccff86b9610e"
// what if it's a nonsensical phrase? word order does not make sense? repeat words in a phrase
// are the number of spaces limited to the original 2 or unlimited spaces?
// <!-- Additional hint 2: Spaces are NOT part of an anagram. But you already read that on Wikipedia, right? -->
// do I remove contractions like I'm if there is no apostrophe in the original? Do apostrophes appear magically like spaces?
//learn about tries which are a datastructure
//http://stackoverflow.com/questions/55210/algorithm-to-generate-anagrams
// console.log(md5('message')," ","78e731027d8fd50ed642340b7c9a63b3"); // "78e731027d8fd50ed642340b7c9a63b3"
// "young lad" -> "an old guy" ("e38510d49aac47d5cb7d47155b9bce6f");
// "nerdy age" -> "green day" ("9f963d602836426c140a637e01f169ac"); //wordlist does not contain 'green'!!!!
// "elvis" -> "lives" ("309b5d4f7785cdf69a212603f95efcc5"); 
// "disc" -> "is cd" ("292d519bfbffa94538f255bca6a3bff6");
// "poultry outwits ants" => ???? ("4624d200580677270a54ccff86b9610e"); 18 characters
// Current Bug Javascript FATAL ERROR: CALL_AND_RETRY_LAST allocation failed - process out of memory

//imports
var md5 = require('md5');
//declarations
// var phraseHash = "4624d200580677270a54ccff86b9610e";
// var phrase = "poultry outwits ants";
var phraseHash = "e38510d49aac47d5cb7d47155b9bce6f";
var phrase = "young lad";
var nonWordSingleCharacters = "bcdefghjklmnopqrstuvwxyz";
var letters = sortChars(phrase);
console.log("phrase: ",phrase);
var wordlist = [], vocabulary = [];
//time anagram / tries generation
var startTimeInMs = Date.now();
//import wordlist "./wordlist"
fs = require('fs');
fs.readFile('./iWordlist', 'utf8', function (err, data) {
	// console log fs error
	if (err) {
		return console.log("fs error",err);
	}

	//clean wordlist of duplicates, non-words letters and words with non anagram characters
	wordlist = removeOnlyTheseLetters(removeDuplicates(data.split('\n')),nonWordSingleCharacters);

	//pop last line with empty string
	if (wordlist[wordlist.length-1]==="") wordlist.pop();

	vocabulary = removeWordsWithNonAnagramChars(wordlist,phrase);

	console.log("parsed vocabulary: ",vocabulary.length);
	console.log("vocabulary: ",vocabulary);
	//build tries of all word permutations
	var tempArray = vocabulary.slice(), anagramsTriesArray = [], anagramsArray = [];
	tempArray.forEach(function(root,index,array){
		// make anagrams tries array and test if phrase is anagram and if it matches the MD5Checksum
		var tempTrie = makeAndTestNode(
										root,
										removeCharactersFromString(root,letters),
										array.slice(),
										"",
										phraseHash
										,anagramsArray
									);
		// push anagram to tries array
		console.log((Date.now() - startTimeInMs )," tempTrie: ", JSON.stringify(tempTrie));
	});

	console.log("anagramsArray count: ",anagramsArray.length);
	console.log("anagramsArray: ",anagramsArray);
/*
	tempArray = []; 
	var count = 0;
	while ( anagramsTriesArray.length>0 ) {
		count++;
		var tempNode = anagramsTriesArray.shift();
		traverseTrieNodes(tempNode,"",tempArray,phraseHash);
	}
*/

});

//prepare regex /[^ailnoprstuwy]/g from letters 'ailnooprssttttuuwy'
function regEx(ltrs){
	var arr = ltrs.split("");
	var str = "";
	arr.reduce(function(prev,curr,index,array){
		if(prev!==curr) str += array[index];
		return curr;
	},"");
	return new RegExp("^[" + str + "]+$");
}

//return an object with keys of the word and it's letters count
function stringInventory(str){
	var result = { s: str , i: {} };
	str = sortChars(str);
	str.split("").forEach(function(el,index,array){
		result.i[el] = str.match(new RegExp(el, "g") || []).length;
	});
	return result;
}

//create an array of all anagram words from the string
//reduce vocabulary by removing words with illegal letters or too many letters
function removeWordsWithNonAnagramChars(list, str){
	var vocab = [], 
		chars = sortChars(str),
		charsObj = stringInventory(chars);
	var allowedCharsArray = removeDuplicates(chars.split(""));

	list.forEach(function(vocabWord,index,listArray){
		
		//remove carraige return from each vocabWord
		if(vocabWord[vocabWord.length-1]==="\r"){
			vocabWord = vocabWord.slice(0,vocabWord.length-1);
		}

		if(vocabWord.match(regEx(chars))) {	
			//if word has no more than allowable characters.
			var vocabWordObj = stringInventory(vocabWord);
			if(subsetOf(charsObj.i,vocabWordObj.i)){
				// console.log("vocab.push(",vocabWordObj,")")
				vocab.push(vocabWord);
			}			
		}		
	});
	// console.log("vocab count:",vocab.length)
	return vocab;
}

//compares keys of string's inventory to set's inventory
//returns false if key inventory is greater
function subsetOf(set,str){
	for(var key in str){
		if ( str[key] > set[key] ) return false;
	}
	return true;
}

//removes characters from the string on at a time or returns original string
function removeCharactersFromString(characters,str){
	// console.log("removeCharactersFromString str:",str,"characters",characters);
	characters = characters.split("");
	for (var i = 0; i < characters.length; i++) {
		str = removeOneCharFromString(str,characters[i]);
		// console.log("removeCharactersFromString return:",str);
	}
	return str;
}

//removes one character from the string or returns original string
function removeOneCharFromString(str,character){
	str = str.split("");
	for (var i = 0; i < str.length; i++) {
		if ( str[i] === character ) {
			str.splice(i,1);
			// console.log("removeOneCharFromString return:",str.join(""));
			return str.join("");
		}
	}
	// console.log("removeOneCharFromString return:",str.join(""));
	return str.join("");
}

//test to see if MD5 matches
function checkMD5(phrase,MD5Checksum){
	return (md5(phrase)===MD5Checksum);
}

//traverse Trie Nodes returns everything
function traverseTrieNodes(node,newPhrase,phraseArray,MD5Checksum){
	// console.log("node: ",node.value);
	newPhrase += node.value + " ";

	if ( node.remainingChars === "" ) { // node.children.length <= 0 && 
		//check newPhrase.trim MD5 for match
		newPhrase = newPhrase.trim();
		if (  checkMD5(newPhrase,MD5Checksum) ) console.log("traverseTrieNodes MD5 checksum matched: ",newPhrase);
		phraseArray.push(newPhrase);
	} else if ( node.children.length <= 0 ) {
		// do nothing
	} else {
		while ( node.children.length > 0 ) {
			var tempNode = node.children.shift();
			traverseTrieNodes(tempNode,newPhrase,phraseArray,MD5Checksum);
		}
	}
}

//traverse Trie Nodes and return all phrases (does not work as intended)
function traverseTrieNodesReturnAll(node){
	// console.log("node: ",node.value);
	//if node.children <= 0 then return value
	if ( node.children.length <= 0 ) {
		return node.value;
	}
	// if node.children > 0 consume top node, return node.value plus recursive results
	var tempNode = {};
	tempNode = node.children.shift();
	return node.value += " " + traverseTrieNodes(tempNode);
}

// Trie Data Structure Node Class
var Node = function () {
  this.value = null;
  this.remainingChars = null;
  this.children = [];
}

//generate all permutations of the phrase by returing a trie of permitted words
function makeAndTestNode(word,ltrs,list,newPhrase,MD5Checksum,anagramsArray){
	// console.log("makeNode str: ",str," ltrs: ",ltrs," list.length:",list.length);
	// console.log(list);
	var node = new Node();
	node.value = word;
	node.remainingChars = removeCharactersFromString(word,ltrs);
	newPhrase += word + " ";

	// console.log("node.remainingChars ",node.remainingChars);
	// if(node.remainingChars.length<=0) {
	if(node.remainingChars == "") {
		newPhrase = newPhrase.trim();
		// console.log("makeAndTestNode newPhrase",newPhrase);
		if ( checkMD5(newPhrase,MD5Checksum) ) {
			console.log((Date.now() - startTimeInMs)," makeAndTestNode MD5 checksum matched: ",newPhrase);
		}
		// anagramsArray.push(newPhrase);
		// console.log("return node because node.remainingChars.length:",node.remainingChars.length);
		console.log((Date.now() - startTimeInMs )," makeAndTestNode newPhrase: ", newPhrase);
		node.children = [];
		return node;
	} else {
		tempList = removeWordsWithNonAnagramChars(list,node.remainingChars);
		tempList.forEach(function(root,index,array){
			// console.log("anagramTrieArray.forEach root:",root);
			node.children.push(makeAndTestNode(root,node.remainingChars,array.slice(),newPhrase,MD5Checksum,anagramsArray));
		});
		return node;
	}
}

//generate all permutations of the phrase by returing a trie of permitted words
function makeNode(word,ltrs,list){
	// console.log("makeNode str: ",str," ltrs: ",ltrs," list.length:",list.length);
	// console.log(list);
	var node = new Node();
	node.value = word;
	node.remainingChars = removeCharactersFromString(word,ltrs);
	// console.log("node.remainingChars ",node.remainingChars);
	if(node.remainingChars.length<=0) {
		// console.log("return node because node.remainingChars.length:",node.remainingChars.length);
		node.children = [];
		return node;
	} else {
		tempList = removeWordsWithNonAnagramChars(list,node.remainingChars);
		tempList.forEach(function(root,index,array){
			// console.log("anagramTrieArray.forEach root:",root);
			node.children.push(makeNode(root,node.remainingChars,array.slice()));
		});
		return node;
	}
}

// remove spaces,  sort and return characters as string 
function sortChars(str){
	return str.replace(/\s/g,"").split("").sort().join("");
}

//remove duplicate words from list
function removeDuplicates(list){
	var result = [];
	list = list.sort();
	list.reduce(function(prev,curr,index,array){
		if(prev!==curr) result.push(array[index]);
		return curr;
	},"");
	return result;
}

//remove letters which are non-words from list like bcdefghjklmnopqrstuvwxyz (not a or i)
function removeOnlyTheseLetters(list, ltrs){
	var vocab = [];
	ltrs = ltrs.split("");

	list.forEach(function(el){
		var match = false;
		for(var i=0;i<ltrs.length;i++){
			if(el===ltrs[i])	{
				match = true;
				continue;
			}
		}
		if (!match) vocab.push(el);
	});
	return vocab;
}

//check if phrase is an anagram, pass only alphabet strings (no spaces etc.)
function phraseIsAnagram(str1, str2){
	if (sortChars(str1) === sortChars(str2)) return true;
	else return false;
}

//removes all instances of a characters in the string from the ltrs and returns the ltrs
function getRemainingChars(str,ltrs){
	ltrs = ltrs.split("");
	str = str.split("");
	str.forEach(function(ch){
		for (var i = 0; i < ltrs.length; i++) {
			if(ltrs[i]===ch) {
				ltrs.splice(i,1);
				i = i - 1;
			}
		};
	});
	return ltrs.join("");
}
