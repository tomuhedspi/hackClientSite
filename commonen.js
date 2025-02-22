var DATA_SERVER_GET = "https://dict.laban.vn/ajax/autocomplete?type=1&site=dictionary&query=";
var DATA_SERVER_GET_UNITS = "https://nguyenthithom.name.vn/api/units";
var DATA_SERVER_IMAGE = "https://nguyenthithom.name.vn/wordImage/";
var DATA_SERVER_POST_COMMENT = "https://nguyenthithom.name.vn/api/chars/";
var DATA_SERVER_POST_WORD = "https://nguyenthithom.name.vn/api/chars";
var DATA_SERVER_POST_COMMENT_SUFFIX = "/comment";
var CURRENT_UNIT = "MINA1";
var CURRENT_PAGE = 0;
var IS_THERE_MORE_DATA = true;
var table = document.getElementById("myTable");
const TYPE_KANJI = 1;
const TYPE_NEWWORD = 0;

// Declare a global variable to store the data
var globalDataFromServer;

function setScrollEvent() {
  var currentScrollHeight = 0;
  var documentHeight = $(document).height();
  $("#scroll_word").scroll(function () {
    if ($(this).scrollTop() + $(this).innerHeight() + 1 >= $(this)[0].scrollHeight) {
      loadMoreword();
    }
  });
}

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

function submitComment() {
  var currentWordID;
  var commentContent;
  var commentUrl;
  var DEFAULT_AUTHOR = "メンバー";
  currentWordID = $("#word_id").text();
  commentContent = $("#mycomment").val();
  commentUrl = DATA_SERVER_POST_COMMENT + currentWordID + DATA_SERVER_POST_COMMENT_SUFFIX;
  $.post(commentUrl, { author_name: DEFAULT_AUTHOR, content: commentContent })
    .done(function (data) {
      $("#mycomment").val("");
      var markup = "<tr><td>" + commentContent + "</td><td>" + DEFAULT_AUTHOR + "</td></tr>";
      $('#table_comment > tbody:last-child').append(markup);
    });
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

function setWordListWithDBindex(url) {
  if (!IS_THERE_MORE_DATA) {
    return;
  }
  $.getJSON(url, function (dataFromServer) {
    var detail;
    var markup;
    if (jQuery.isEmptyObject(dataFromServer.data)) {
      IS_THERE_MORE_DATA = false;
      return;
    }
    var datalist = dataFromServer.data;
    for (let i = 0; i < datalist.length; i++) {
      detail = datalist[i];
      markup = "<tr onclick='tdclickDBindex(" + detail['id'] + ");'><td>" + detail['word'] + "</td><td>" + detail['note'] + "</td></tr>";
      $('#myTable > tbody:last-child').append(markup);
    }
  });
}

function loadMoreword() {
  CURRENT_PAGE += 1;
  var obj = getSearchParamWithPage(CURRENT_PAGE);
  var url = DATA_SERVER_GET + '?' + $.param(obj);
  setWordListWithDBindex(url);
}

function getSearchParamWithPage(pagenum) {
  var obj = new Object();
  var keyword = $("#input_keyword").val();
  obj.search = keyword;
  obj.book = CURRENT_UNIT;
  obj.page = pagenum;
  return obj;
}

function setClearWordList() {
  $("#myTable > tbody").empty();
  CURRENT_PAGE = 0;
  IS_THERE_MORE_DATA = true;
}

function getNextWord() {
  var idText = $("#word_next").text();
  var nextID = parseInt(idText);
  getWordFromDB(nextID);
}

function getPreviousWord() {
  var idText = $("#word_prev").text();
  var nextID = parseInt(idText);
  if (nextID > 0) {
    getWordFromDB(nextID);
  }
}

function setUnit() {
  var url = DATA_SERVER_GET_UNITS;
  $.getJSON(url, function (dataFromServer) {
    var units = dataFromServer.data;
    addUnitButtons(units);
  });
}

function addUnitButtons(units) {
  var detail;
  var markup;
  for (let i = 0; i < units.length; i++) {
    detail = units[i];
    markup = "<button value='" + detail['code'] + "' class='btn btn-outline-secondary btn-sm unit' onclick='selectUnit(this);'>" + detail['namevn'] + "</button>";
    $("#unitsList").append(markup);
  }
}

function showWordList() {
  $("#scroll_word").show();
  $("#unitsList").hide();
  $("#myTable").show();
}

function loadAudio(audioName) {
  document.getElementById("my-audio").setAttribute('src', audioName);
  var myAudio = document.getElementById("my-audio");
  myAudio.play();
}

function showUnits() {
  $("#scroll_word").show();
  $("#myTable").hide();
  $("#unitsList").show();
}

function selectUnit(obj) {
  CURRENT_UNIT = obj.value;
  setClearWordList();
  loadMoreword();
  if ($(window).width() <= 570) {
    $("#scroll_word").show();
  }
  $("#unitLabel").text(obj.innerHTML);
  $("#unitsList").hide();
  $("#myTable").show();
}

function submitWord() {
  var wordContent;
  var readingContent;
  var noteContent;
  var meaningContent;
  var typeContent;
  var kunContent;
  var onContent;
  wordContent = $("#myword").val();
  readingContent = $("#myreading").val();
  meaningContent = $("#mymeaning").val();
  noteContent = $("#mynote").val();
  typeContent = $("#mytype").val();
  kunContent = $("#mykun").val();
  onContent = $("#myon").val();

  $.post(DATA_SERVER_POST_WORD, { word: wordContent, reading: readingContent, note: noteContent, meaning: meaningContent, type: typeContent, kun: kunContent, on: onContent })
    .done(function (data) {
      $("#mycomment").val("");
      $("#myreading").val("");
      $("#mymeaning").val("");
      $("#mynote").val("");
      $("#mykun").val("");
      $("#myon").val("");
    });
  alert("Bạn ơi! Cám ơn bạn vì đã đóng góp nhé!");
}

function setwordtype(selectedtype) {
  var type;
  if (selectedtype) {
    type = selectedtype.value;
  } else {
    type = 0;
  }

  if (type == TYPE_KANJI) {
    $("#mywordlabel").text("Hán tự 漢字");
    $("#myreadinglabel").text("Phiên âm Hán Việt");
    $("#myword").attr("placeholder", "日");
    $("#myreading").attr("placeholder", "NHẬT");
    $("#kun").show();
    $("#on").show();
  } else {
    $("#mywordlabel").text("Từ Vựng( Viết bằng Chữ hán hoặc Hiragana)");
    $("#myreadinglabel").text("Cách đọc( Viết bằng Hiragana)");
    $("#myword").attr("placeholder", "勉強");
    $("#myreading").attr("placeholder", "べんきょう");
    $("#kun").hide();
    $("#on").hide();
  }
}

function setButtonDisable() {
  if ($("#myword").val().length >= 1 && $("#myreading").val().length >= 1 && $("#mymeaning").val().length >= 1) {
    $('#submitButton').prop('disabled', false);
  } else {
    $('#submitButton').prop('disabled', true);
  }
}

function ignoreEnter() {
  document.getElementById("myForm").onkeypress = function (e) {
    var key = e.charCode || e.keyCode || 0;
    if (key == 13) {
      e.preventDefault();
    }
  }
}

function updateAudio(audioName) {
  // change text
  $("#listeningfile").text(audioName);

  // set audio
  document.getElementById("my-audio").setAttribute('src', audioName);
  var myAudio = document.getElementById("my-audio");
  myAudio.play();
}

// Object đầu vào
const inputData = {
  "query": "friendliness",
  "suggestions": [
    {
      "select": "friendliness",
      "link": "/find?type=1&query=friendliness",
      "data": "<a  href=\"javascript:;\" rel=\"/find?type=1&query=friendliness\"><span class=\"fl\"><span class=\"hl\">friendliness<\/span><\/span><span class=\"fr hl\" >/'frendlinis/<img src=\"https://stc-laban.zdn.vn/dictionary/images/vi_dict_EV_icon.png\" style=\"margin-left: 5px;position: relative;top: 2px;\" ><\/span><div class=\"clr\"><\/div><p>Danh từ: sự thân thiện; tình hữu nghị, tính chất giao hữu (của một cuộc đấu\u2026)<\/p><\/a>",
      "value": "38008"
    }
  ]
};

function extractPhonetic(obj, i) {
  // Kiểm tra cấu trúc object hợp lệ
  if (!obj?.suggestions?.[i]?.data) return null;

  // Sử dụng Regular Expression để trích xuất giá trị
  const regex = /<span class="fr hl" >(.*?)<img/;
  const match = obj.suggestions[i].data.match(regex);

  return match ? match[1] : null;
}

function extractDefinition(obj, i) {
  // Kiểm tra cấu trúc object hợp lệ
  if (!obj?.suggestions?.[i]?.data) return null;

  // Bóc tách nội dung trong thẻ <p>
  const pTagRegex = /<p>(.*?)<\/p>/;
  const pTagMatch = obj.suggestions[i].data.match(pTagRegex);

  if (!pTagMatch) return null;

  // Lọc phần nội dung trước dấu '…' và loại bỏ khoảng trắng thừa
  const definition = pTagMatch[1]
    .split(/…/)[0]         // Cắt tại ký tự ellipsis (U+2026)
    .replace(/\s+$/, '');  // Xóa khoảng trắng cuối chuỗi

  return definition || null;
}

function getKeyword(obj, i) {
  // Cách 2: Lấy từ trường select trong suggestion đầu tiên (nếu query không tồn tại)
  return obj?.suggestions?.[i]?.select ?? null;
}

function getHintForWord() {
  var phonetic = $("#word_reading").val();
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