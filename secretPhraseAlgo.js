// An anagram of the phrase is: "poultry outwits ants"
// The MD5 hash of the secret phrase is "4624d200580677270a54ccff86b9610e"
// what if it's a nonsensical phrase? word order does not make sense? repeat words in a phrase
// are the number of spaces limited to the original 2 or unlimited spaces?
// <!-- Additional hint 2: Spaces are NOT part of an anagram. But you already read that on Wikipedia, right? -->
// do I remove contractions like I'm if there is no apostrophe in the original? Do apostrophes appear magically like spaces?

//learn about tries which are a datastructure
//http://stackoverflow.com/questions/55210/algorithm-to-generate-anagrams

//imports
var md5 = require('md5');
// console.log(md5('message')," ","78e731027d8fd50ed642340b7c9a63b3"); // "78e731027d8fd50ed642340b7c9a63b3"
//declarations
var phraseHash = "9f963d602836426c140a637e01f169ac";
var phrase = "nerdy age";
// "poultry outwits ants" => ???? ("4624d200580677270a54ccff86b9610e");
// "young lad" -> "an old guy" ("e38510d49aac47d5cb7d47155b9bce6f");
// "nerdy age" -> "green day" ("9f963d602836426c140a637e01f169ac");
// "elvis" -> "lives" ("309b5d4f7785cdf69a212603f95efcc5"); 
// "disc" -> "is cd" ("292d519bfbffa94538f255bca6a3bff6");
var nonWordSingleCharacters = "bcdefghjklmnopqrstuvwxyz";
var letters = sortChars(phrase);
console.log("letters",letters);	
var wordlist = [], vocabulary = [];
//import wordlist "./wordlist"
fs = require('fs');
fs.readFile('./wordlist', 'utf8', function (err, data) {
	if (err) {
		return console.log("fs error",err);
	}
	//clean wordlist of duplicates, non-words letters and words with non anagram characters
	wordlist = removeOnlyTheseLetters(removeDuplicates(data.split('\n')),nonWordSingleCharacters);
	if (wordlist[wordlist.length-1]==="") wordlist.pop();
	console.log("wordlist word count:",wordlist.length);
	vocabulary = removeWordsWithNonAnagramChars(wordlist,phrase);
	console.log("vocabulary word count:",vocabulary.length);
	//build tries of all word permutations
	var tempArray = vocabulary.slice(), anagramsTriesArray = [];
	tempArray.forEach(function(root,index,array){
		var tempTrie = makeNode(root,removeCharactersFromString(root,letters),array.slice());
		console.log("tempTrie:",tempTrie);
		anagramsTriesArray.push(tempTrie);
	});

	console.log("anagramsTriesArray.length: ",anagramsTriesArray.length);
	// console.log("anagramsTriesArray: ",JSON.stringify(anagramsTriesArray));
	// traverse anagramTriesArray to create anagram phrases and test against MD5 hash
	tempArray = []; 
	var count = 0;
	while ( anagramsTriesArray.length>0 ){
		// console.log("while loop:",count);
		count++;
		var tempNode = anagramsTriesArray.shift();
		// console.log("tempNode",tempNode.value);
		var tempPhrase = traverseTrieNodes(tempNode);
		// console.log("tempPhrase: ",tempPhrase);
		tempArray.push(tempPhrase);
		if(checkMD5(tempPhrase,phraseHash)) {
			console.log("md5 match: ",tempPhrase);
			return tempPhrase;
		}
	}

	console.log("anagramsTriesArray",tempArray);
});

//test to see if MD5 matches
function checkMD5(phrase,MD5Checksum){
	return (md5(phrase)===MD5Checksum);
}

//traverse Trie Nodes
function traverseTrieNodes(node){
	// console.log("node: ",node.value);
	//check node.children, if node.children > 0 consume top node and return
	if ( node.children.length <= 0 ) {
		return node.value;
	}
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

//removes one character from the string or returns original string
function removeOneCharFromString(str,character){
	str = str.split("");
	for (var i = 0; i < str.length; i++) {
		if ( str[i] === character ) {
			str.splice(i,1);
			return str.join("");
		}
	}
	return str.join("");
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

//create an array of all anagram words from the string
//reduce vocabulary by removing words with illegal letters or too many letters
function removeWordsWithNonAnagramChars(list, str){
	var vocab = [], 
		chars = sortChars(str),
		charsObj = stringInventory(chars);
	var allowedCharsArray = removeDuplicates(chars.split(""));
	// console.log("allowedChars ",allowedCharsArray);
	// console.log("start vocab count:",vocab.length)

	list.forEach(function(vocabWord,index,listArray){
		//if word has only allowedChars <-- do this fist for speed
		if(vocabWord.match(regEx(chars))) {			
			//if word has no more than allowable characters.
			var vocabWordObj = stringInventory(vocabWord);
			if(subsetOf(charsObj.inventory,vocabWordObj.inventory)){
				vocab.push(vocabWord);
			}			
		}
		
	});
	// console.log(vocab);
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

//return an object with keys of the word and it's letters count
function stringInventory(str){
	var result = { string: str , inventory: {} };
	str = sortChars(str);
	str.split("").forEach(function(el,index,array){
		result.inventory[el] = str.match(new RegExp(el, "g") || []).length;
	});
	return result;
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
