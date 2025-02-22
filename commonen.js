var DATA_SERVER_GET = "https://dict.laban.vn/ajax/autocomplete?type=1&site=dictionary&query=";
var DICT_FINAL_CONSONANT = new Map();
var DICT_INITIAL_CONSONANT = new Map();
var DICT_SAME_SOUND = new Map();
var DICT_SINGLE_CONSONANT = new Map();
var DICT_VOWEL = new Map();
var DICT_VIETNAMESE = new Map();
const SEPARATE_CHARACTER = " ";

var IS_THERE_MORE_DATA = true;
var table = document.getElementById("myTable");

// Declare a global variable to store the data
var globalDataFromServer;

function tdclickDBindex(i) {
  var phonetic = extractPhonetic(globalDataFromServer, i);
  var definition = extractDefinition(globalDataFromServer, i);
  var keyword = getKeyword(globalDataFromServer, i);
  setWordDetail(keyword, phonetic, definition);
  if ($(window).width() <= 570) {
    $("#scroll_word").hide();
    $("#result_list").hide();
  }
}

function setWordDetail(keyword, phonetic, meaning) {
  $("#word_text").val(keyword);
  $("#word_reading").val(phonetic);
  $("#word_meaning").val(meaning);
  $("#word_note").val("");
}

function setWordList(url) {
  $.getJSON(url, function (dataFromServer) {
    // Store the data in the global variable
    globalDataFromServer = dataFromServer;

    var datalistLen = dataFromServer.suggestions.length;
    var phonetic, definition, keyword;
    var markup;
    
    for (let i = 0; i < datalistLen; i++) {
      phonetic = extractPhonetic(dataFromServer, i);
      definition = extractDefinition(dataFromServer, i);
      keyword = getKeyword(dataFromServer, i);
      markup = "<tr onclick='tdclickDBindex(\"" + i + "\");'><td>" + keyword + "</td><td>" + definition + "</td></tr>";
      $('#myTable > tbody:last-child').append(markup);
    }
    if (datalistLen > 0) {
      $("#result_list").show();
      $("#scroll_word").show();
    }
  });
}

function inputKeywordListener() {
  // Delaying the function execute
  if (this.timer) {
    window.clearTimeout(this.timer);
  }
  this.timer = window.setTimeout(function () {
    searchWord();
  }, 1000);
}

function searchWord() {
  var keyword = $("#input_keyword").val();
  if (keyword.length == 0) {
    return;
  }
  var url = DATA_SERVER_GET + keyword;
  setClearWordList();
  setWordList(url);
}

function setClearWordList() {
  $("#myTable > tbody").empty();
  CURRENT_PAGE = 0;
  IS_THERE_MORE_DATA = true;
}

function showWordList() {
  $("#scroll_word").show();
  $("#unitsList").hide();
  $("#myTable").show();
}


function ignoreEnter() {
  document.getElementById("myForm").onkeypress = function (e) {
    var key = e.charCode || e.keyCode || 0;
    if (key == 13) {
      e.preventDefault();
    }
  }
}

function extractPhonetic(obj, i) {
  if (!obj?.suggestions?.[i]?.data) return null;
  const regex = /<span class="fr hl" >(.*?)<img/;
  const match = obj.suggestions[i].data.match(regex);

  return match ? match[1] : null;
}

function extractDefinition(obj, i) {
  if (!obj?.suggestions?.[i]?.data) return null;
  const pTagRegex = /<p>(.*?)<\/p>/;
  const pTagMatch = obj.suggestions[i].data.match(pTagRegex);

  if (!pTagMatch) return null;
  const definition = pTagMatch[1]
    .split(/…/)[0]  
    .replace(/\s+$/, ''); 

  return definition || null;
}

function getKeyword(obj, i) {
  return obj?.suggestions?.[i]?.select ?? null;
}

function setAuthorName() {
  // Load the saved value from local storage
  const savedAddedBy = localStorage.getItem('added_by');
  if (savedAddedBy) {
    $('#added_by').val(savedAddedBy);
  } else {
    $('#added_by').val('member');
  }
}

function saveAuthorName() {
  // Save the value to local storage
  localStorage.setItem('added_by', $('#added_by').val());
}
function sortMapByKeyLength(map) {
  // Convert map to an array of [key, value] pairs
  let mapArray = Array.from(map);

  // Sort the array by the length of the key in descending order
  mapArray.sort((a, b) => b[0].length - a[0].length);

  // Convert the sorted array back to a map
  let sortedMap = new Map(mapArray);

  return sortedMap;
}

function loadVowelData() {
  // Check if the data is already loaded
  if (DICT_VOWEL.size > 0) {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    Papa.parse("hintsource/VOWEL.csv", {
      download: true,
      header: false,
      complete: function(results) {
        results.data.forEach(row => {
          const key = row[0];
          const value = row.slice(1);

          if (DICT_VOWEL.has(key)) {
            DICT_VOWEL.get(key).push(...value);
          } else {
            DICT_VOWEL.set(key, value);
          }
        });
        DICT_VOWEL = sortMapByKeyLength(DICT_VOWEL);
        resolve(true);
      },
      error: function(error) {
        console.error("Error loading vowel data:", error);
        reject(error);
      }
    });
  });
}

function loadSameSoundData() {
  // Check if the data is already loaded
  if (DICT_SAME_SOUND.size > 0) {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    Papa.parse("hintsource/SAME_SOUND.csv", {
      download: true,
      header: false,
      complete: function(results) {
        results.data.forEach(row => {
          const key = row[0];
          const value = row.slice(1);

          if (DICT_SAME_SOUND.has(key)) {
            DICT_SAME_SOUND.get(key).push(...value);
          } else {
            DICT_SAME_SOUND.set(key, value);
          }
        });
        DICT_SAME_SOUND = sortMapByKeyLength(DICT_SAME_SOUND);
        resolve(true);
      },
      error: function(error) {
        console.error("Error loading same sound data:", error);
        reject(error);
      }
    });
  });
}

function loadInitialConsonantData() {
  // Check if the data is already loaded
  if (DICT_INITIAL_CONSONANT.size > 0) {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    Papa.parse("hintsource/INITIAL_CONSONANT.csv", {
      download: true,
      header: false,
      complete: function(results) {
        results.data.forEach(row => {
          const key = row[0];
          let value = row.slice(1).filter(v => v !== null && v !== '');

          if (DICT_INITIAL_CONSONANT.has(key)) {
            DICT_INITIAL_CONSONANT.get(key).push(...value);
          } else {
            DICT_INITIAL_CONSONANT.set(key, value);
          }
        });
        DICT_INITIAL_CONSONANT = sortMapByKeyLength(DICT_INITIAL_CONSONANT);
        resolve(true);
      },
      error: function(error) {
        console.error("Error loading initial consonant data:", error);
        reject(error);
      }
    });
  });
}

function loadSingleConsonantData() {
  // Check if the data is already loaded
  if (DICT_SINGLE_CONSONANT.size > 0) {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    Papa.parse("hintsource/SINGLE_CONSONANT.csv", {
      download: true,
      header: false,
      complete: function(results) {
        results.data.forEach(row => {
          const key = row[0];
          const value = row.slice(1);

          if (DICT_SINGLE_CONSONANT.has(key)) {
            DICT_SINGLE_CONSONANT.get(key).push(...value);
          } else {
            DICT_SINGLE_CONSONANT.set(key, value);
          }
        });
        DICT_SINGLE_CONSONANT = sortMapByKeyLength(DICT_SINGLE_CONSONANT);
        resolve(true);
      },
      error: function(error) {
        console.error("Error loading single consonant data:", error);
        reject(error);
      }
    });
  });
}

function loadVietnameseDictionaryData() {
  // Check if the data is already loaded
  if (DICT_VIETNAMESE.size > 0) {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    Papa.parse("hintsource/VIETNAMESE_DICTIONARY.csv", {
      download: true,
      header: false,
      complete: function(results) {
        results.data.forEach(row => {
          const key = row[0];
          let value = row.slice(1).filter(v => v !== null && v !== '');

          if (DICT_VIETNAMESE.has(key)) {
            DICT_VIETNAMESE.get(key).push(...value);
          } else {
            DICT_VIETNAMESE.set(key, value);
          }
        });
        DICT_VIETNAMESE = sortMapByKeyLength(DICT_VIETNAMESE);
        resolve(true);
      },
      error: function(error) {
        console.error("Error loading Vietnamese dictionary data:", error);
        reject(error);
      }
    });
  });
}

function loadFinalConsonantData() {
  // Check if the data is already loaded
  if (DICT_FINAL_CONSONANT.size > 0) {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    Papa.parse("hintsource/FINAL_CONSONANT.csv", {
      download: true,
      header: false,
      complete: function(results) {
        results.data.forEach(row => {
          const key = row[0];
          const value = row.slice(1);

          if (DICT_FINAL_CONSONANT.has(key)) {
            DICT_FINAL_CONSONANT.get(key).push(...value);
          } else {
            DICT_FINAL_CONSONANT.set(key, value);
          }
        });
        DICT_FINAL_CONSONANT = sortMapByKeyLength(DICT_FINAL_CONSONANT);
        resolve(true);
      },
      error: function(error) {
        console.error("Error loading FINAL_CONSONANT data:", error);
        reject(error);
      }
    });
  });
}

// function displayDictVowel() {
//   let content = '';
//   DICT_VOWEL.forEach((value, key) => {
//     content += `<strong>${key}:</strong> ${value.join(', ')}<br>`;
//   });
//   $('#hint_text_content').html(content);
// }

// function displayDictSameSound() {
//   let content = '';
//   DICT_SAME_SOUND.forEach((value, key) => {
//     content += `<strong>${key}:</strong> ${value.join(', ')}<br>`;
//   });
//   $('#hint_text_content').html(content);
// }

// function displayDictFinalConsonant() {
//   let content = '';
//   DICT_FINAL_CONSONANT.forEach((value, key) => {
//     content += `<strong>${key}:</strong> ${value.join(', ')}<br>`;
//   });
//   $('#hint_text_content').html(content);
// }

// function displayDictInitialConsonant() {
//   let content = '';
//   DICT_INITIAL_CONSONANT.forEach((value, key) => {
//     content += `<strong>${key}:</strong> ${value.join(', ')}<br>`;
//   });
//   $('#hint_text_content').html(content);
// }

// function displayDictSingleConsonant() {
//   let content = '';
//   DICT_SINGLE_CONSONANT.forEach((value, key) => {
//     content += `<strong>${key}:</strong> ${value.join(', ')}<br>`;
//   });
//   $('#hint_text_content').html(content);
// }

// function displayDictVietnamese() {
//   let content = '';
//   DICT_VIETNAMESE.forEach((value, key) => {
//     content += `<strong>${key}:</strong> ${value.join(', ')}<br>`;
//   });
//   $('#hint_text_content').html(content);
// }

function loadGlobalData() {
  return Promise.all([
    loadVowelData(),
    loadFinalConsonantData(),
    loadInitialConsonantData(),
    loadSingleConsonantData(),
    loadVietnameseDictionaryData(),
    loadSameSoundData()
  ]);
}

function getHintForWord() {
  var phonetic = $("#word_reading").val();
  if (!phonetic) {
    return;
  }

  // Call the function to load the data
  loadGlobalData().then(() => {
    phonetic = setSpaceAddBetweenSound(phonetic);
    var sentencesArray = getSentences(phonetic);
    var hint = getVietNameseSentences(sentencesArray);
    showHint(hint);

  }).catch(error => {
    console.error("Error loading data:", error);
  });
}

function showHint(hintArray) {
  var hintContent = '';
  hintArray.forEach(hint => {
    hintContent += `<strong>${hint}</strong><br>`;
  });
  $('#hint_text').html(hintContent);
}

function getVietNameseSentences(sentencesArray) {
  var result = new Array();
  sentencesArray.forEach(sentence => {
    const hintSentences = convertEnglishSentenceToVietnamese(sentence);
    result.push(hintSentences);
  });

  return result;
}

function convertEnglishSentenceToVietnamese(englishSentence) {
  var vietnameseHint = new Array();
  var result = new Array();
  var splited = englishSentence.split(SEPARATE_CHARACTER);


  for (let i = 0; i < splited.length; i++) {
    const currentWord = splited[i];
    if (!currentWord || currentWord.length === 0) {
      continue;
    }

    const hintForWord = DICT_VIETNAMESE.get(currentWord);
    if (hintForWord) {
      vietnameseHint.push(hintForWord);
    }
  }
  result=combineStrings(vietnameseHint,SEPARATE_CHARACTER);
  return result;

}

function getSentences(phonetic) {
  var smallPartsArray = new Array();
  var wordsArray = new Array();
  smallPartsArray = getVietNamesePart(phonetic);
  wordsArray = combineStrings(smallPartsArray);
  return wordsArray;
}

function combineStrings(parentArray,separateCharacter='') {
  // Hàm đệ quy để ghép phần tử ChildArray
  function cartesianProduct(arrays, index = 0, current = [], result = []) {
      // Khi đã ghép toàn bộ mảng con thì thêm chuỗi vào kết quả
      if (index === arrays.length) {
          result.push(current.join(separateCharacter));
          return;
      }
      // Duyệt qua từng phần tử trong mảng con hiện tại
      for (let element of arrays[index]) {
          cartesianProduct(arrays, index + 1, [...current, element], result);
      }
      return result;
  }

  // Gọi hàm cartesianProduct với ParentArray
  return cartesianProduct(parentArray);
}





//trả vể một mảng các phụ âm, nguyên âm tiếng Việt tương ứng với các ký tự trong phonetic
function getVietNamesePart(phonetic) {
  var hintCharacters = new Array();
  var vietnameseHint = new Array();
  var splited = phonetic.split(SEPARATE_CHARACTER);
  for (let i = 0; i < splited.length; i++) {
    const currentChar = splited[i];
    const nextChar = splited[i + 1] || '';
    if (!currentChar || currentChar.length === 0) {
      continue;
    }
    if (isVowel(currentChar)) {
      vietnameseHint = DICT_VOWEL.get(currentChar);
    } 
    if(!isVowel(currentChar) && isVowel(nextChar)){
      vietnameseHint = DICT_INITIAL_CONSONANT.get(currentChar);
    }
    if(!isVowel(currentChar) && !isVowel(nextChar)){
      vietnameseHint = DICT_FINAL_CONSONANT.get(currentChar);
    }
    if(!isVowel(currentChar) && i == splited.length-1){
      if (DICT_SINGLE_CONSONANT.has(currentChar)) {
        vietnameseHint = DICT_SINGLE_CONSONANT.get(currentChar);
      }
    }

    hintCharacters.push(vietnameseHint);
  }
  return hintCharacters;
}


function setSpaceAddBetweenSound(phonetic) {
  var spaceAdded = "";
  spaceAdded=replaceUnusedCharacter(phonetic);
  spaceAdded=addSeparateCharacterToDiphthongs(spaceAdded);
  spaceAdded=addSeparateCharacterToShortVowel(spaceAdded);
  spaceAdded=addSeparateCharacterBetweenConsonant(spaceAdded);
  return spaceAdded;
}



function isVowel(myCharacters) {
  if (!myCharacters || myCharacters.length === 0) {
    return false;
  }
  return DICT_VOWEL.has(myCharacters);
}

function replaceUnusedCharacter(phonetic) {
  return phonetic.replace(/\/ˈ/g, '').replace(/\//g, '').replace(/ˈ/g, ' ').replace(/'/g, ' ');
}
//thêm dấu chia cách vào trước và sau các nguyên âm kép
function addSeparateCharacterToDiphthongs(phonetic) {
  var spaceAdded = phonetic;
  for (let key of DICT_VOWEL.keys()) {
    if (key.length >= 2) {
      spaceAdded = spaceAdded.replace(new RegExp(key, 'g'), SEPARATE_CHARACTER + key + SEPARATE_CHARACTER);
    }
  }
  return spaceAdded;
}
//thêm dấu chia cách vào trước va sau nguyên âm đơn
function addSeparateCharacterToShortVowel(phonetic) {
  var spaceAdded = "";
  for (let i = 0; i < phonetic.length; i++) {
    const currentChar = phonetic[i];
    const prevChar = phonetic[i - 1] || '';
    const nextChar = phonetic[i + 1] || '';

    if (isVowel(currentChar) && !isVowel(prevChar) && !isVowel(nextChar)) {
      spaceAdded = spaceAdded + SEPARATE_CHARACTER + currentChar + SEPARATE_CHARACTER;
    }else{
      spaceAdded =spaceAdded + currentChar;
    }
  }
  return spaceAdded;
}
// them space vao truoc va sau toan bo cac phu am trong tu
function addSeparateCharacterBetweenConsonant(phonetic) {
  var spaceAdded = "";
  var splited = phonetic.split(SEPARATE_CHARACTER);
  for (let i = 0; i < splited.length - 1; i++) {
    const currentChar = splited[i];
    const prevChar = splited[i - 1] || '';
    const nextChar = splited[i + 1] || '';
    // chia cắt các sonsonant đứng cạnh nhau
    if (!isVowel(currentChar) && isVowel(prevChar) && isVowel(nextChar)) {
      const spaceAddedConsonant = separateTwoConsonant(currentChar);
      spaceAdded = spaceAdded  + SEPARATE_CHARACTER + spaceAddedConsonant;
    }else{
      spaceAdded =spaceAdded + SEPARATE_CHARACTER + currentChar;
    }
  }
  // chia cat doi voi consonant cuoi cung
  var lastChar = splited[splited.length - 1];
  lastChar=separateLastSingleConsonant(lastChar);
  spaceAdded = spaceAdded + SEPARATE_CHARACTER + lastChar;

  return spaceAdded;
}

function separateLastSingleConsonant(consonantString){
  var spaceAdded = consonantString;
  for (let key of DICT_SINGLE_CONSONANT.keys()) {
    if(consonantString.endsWith(key)){
      const leftPart = consonantString.substring(0,consonantString.length-key.length);
      const rightPart = key; 
      spaceAdded = leftPart + SEPARATE_CHARACTER + rightPart;
      break;
    }
  }
  return spaceAdded;
}

function separateTwoConsonant(consonantString){
  var spaceAdded = consonantString;
  for (let key of DICT_INITIAL_CONSONANT.keys()) {
    if(consonantString.endsWith(key)){
      const leftPart = consonantString.substring(0,consonantString.length-key.length);
      const rightPart = key; 
      spaceAdded = leftPart + SEPARATE_CHARACTER + rightPart;
      break;
    }
  }
  return spaceAdded;
}