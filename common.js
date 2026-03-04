var DATA_SERVER_GET = "https://nguyenthithom.name.vn/api/chars";
var DATA_SERVER_GET_UNITS = "https://nguyenthithom.name.vn/api/units";
var DATA_SERVER_GET_EXACT_WORD_ENGLISH= "https://nguyenthithom.name.vn/api/exact?type=2&search=";
var DATA_SERVER_GET_HINT_ENGLISH = "https://nguyenthithom.name.vn/api/hints/english?reading=";
var DATA_SERVER_GET_HINT_JAPANESE = "https://nguyenthithom.name.vn/api/hints/japanese?reading=";
var DATA_SERVER_IMAGE = "https://nguyenthithom.name.vn/wordImage/";
var DATA_SERVER_POST_COMMENT = "https://nguyenthithom.name.vn/api/chars/";
var DATA_SERVER_POST_WORD = "https://nguyenthithom.name.vn/api/chars";
var DATA_SERVER_WORD_INFORMATION = "https://dict.laban.vn/ajax/autocomplete?type=1&site=dictionary&query=";
var DATA_SERVER_POST_COMMENT_SUFFIX = "/comment";
var CURRENT_UNIT ="MINA1";
var CURRENT_PAGE = 0;
var IS_THERE_MORE_DATA = true;
var table = document.getElementById("myTable");
const TYPE_KANJI =1;
const TYPE_JAPANESE =0;
const TYPE_ENGLISH =2;
var globalDataFromServer;

function clickWordInformationIndex(i) {
  var phonetic = extractPhonetic(globalDataFromServer, i);
  var definition = extractDefinition(globalDataFromServer, i);
  var keyword = getKeyword(globalDataFromServer, i);
  setWordInformation(keyword, phonetic, definition);
  if ($(window).width() <= 570) {
    $("#scroll_word").hide();
    $("#result_list").hide();
  }
}
function setWordInformation(keyword, phonetic, meaning) {
  $("#myword").val(keyword);
  $("#myreading").val(phonetic);

  // Xử lý tách từ loại và nghĩa
  if (typeof meaning === "string" && meaning.includes(":")) {
    const idx = meaning.indexOf(":");
    const partOfSpeech = meaning.slice(0, idx).trim();
    const meaningText = meaning.slice(idx + 1).trim();
    $("#mypartofspeech").val(partOfSpeech);
    $("#mymeaning").val(meaningText);
  } else {
    $("#mypartofspeech").val("");
    $("#mymeaning").val(meaning);
  }
}


function setScrollEvent(){
    var currentScrollHeight =0;
    var documentHeight =$(document).height();
    $("#scroll_word").scroll(function() {
        if($(this).scrollTop() + $(this).innerHeight()+1 >= $(this)[0].scrollHeight) {
          loadMoreword(); 
        } 
    });
};

function setWordComment(singleWord){
    var detail;
    var comment_list=new Object;
    // Show comment area when comments are set for a selected DB word
    $("#commentsCollapse").show();
    $("#comment_title").show();
    $("#table_comment > tbody").empty();
    comment_list=singleWord['comment'];
    for (let i = 0; i < comment_list.length; i++) {
      detail= comment_list[i];
      markup = "<tr><td>" + detail['content'] + "</td><td>" + detail['author_name'] + "</td></tr>";
      $('#table_comment > tbody:last-child').append(markup); 
    }
};

function tdclickDBindex(wordID){
    getWordFromDB(wordID);
    if($(window).width() <= 570){
      $("#scroll_word").hide();
      $("#result_list").hide();
    }
};

function submitComment(){
    var currentWordID;
    var commentContent;
    var commentUrl;
    var author_name = $("#myname").val();
    if (!author_name) {
      author_name = "メンバー";
    }
    currentWordID= $("#word_id").text();
    commentContent= $("#mycomment").val();
    commentUrl= DATA_SERVER_POST_COMMENT + currentWordID +DATA_SERVER_POST_COMMENT_SUFFIX;
    $.post( commentUrl, { author_name: author_name, content:commentContent})
    .done(function( data ) {
        $("#mycomment").val("");
        markup = "<tr><td>" + commentContent + "</td><td>" + author_name + "</td></tr>";
        $('#table_comment > tbody:last-child').append(markup); 
    });
}

function setDefaultMyname() {
    var myName = loadMyName();
    if (myName) {
      $("#myname").val(myName);
    }else{
      $("#myname").val("メンバー");
    }
}

function getWordFromDB(wordID){
    var url = DATA_SERVER_GET + '/'+ wordID;
    $.getJSON(url, function(dataFromServer){
      word=dataFromServer.data
      var nextID =dataFromServer.next;
      var prevID =dataFromServer.prev;
      setWordDetail(word,nextID,prevID);
      setWordComment(word);
    });
}

function setWordDetail(singleWord,nextID,prevID){
    $("#word_id").text(singleWord['id']);
    $("#word_text").text(singleWord['word']);
    $("#word_reading").text(singleWord['reading']);
    $("#word_pos").text(singleWord['pos'] || "");
    $("#word_meaning").text(singleWord['meaning']);
    $("#word_note").text(singleWord['note']);
    $("#word_kun").text(singleWord['kun']);
    $("#word_on").text(singleWord['on']);
    $("#word_next").text(nextID);
    $("#word_prev").text(prevID);

    if(singleWord['image'] !=null){
      $('#word_image').attr("src", DATA_SERVER_IMAGE + singleWord['image'] );
    }else{
      $('#word_image').attr("src", "image/default.jpg" );
    }
    
    // Hiển thị navigation buttons khi đã có dữ liệu từ vựng
    if(singleWord['word'] && singleWord['meaning']){
      $('.word-navigation-buttons').show();
    }
}

function setWordList(url){
  $.getJSON(url, function(dataFromServer){
    var datalist = dataFromServer.data;
    var detail ;
    var markup;
    for (let i = 0; i < datalist.length; i++) {
      detail = datalist[i];
      markup = "<tr onclick='tdclickDBindex("+detail['id']+");'><td>" + detail['word'] + "</td><td>" + detail['note'] + "</td></tr>";
      $('#myTable > tbody:last-child').append(markup); 
    }
    if(datalist.length>0){
      $("#result_list").show();
      $("#scroll_word").show();
    }
  });
}

function inputKeywordListener(default_wordtype){
    //Delaying the function execute
    if (this.timer) {
      window.clearTimeout(this.timer);
    }
    this.timer = window.setTimeout(function() {
      searchWord(default_wordtype);
    }, 500);
}

function GetEnglishWordInformationListener(){
    //Delaying the function execute
    if (this.timer) {
      window.clearTimeout(this.timer);
    }
    this.timer = window.setTimeout(function() {
      getEnglishWordInformation(); 
    }, 700);
}

async function getEnglishWordInformation() {
  var keyword = $("#input_new_word").val();
  if (keyword.length == 0) {
    return;
  }

  setClearWordList();
  
  try {
    // Đợi setEnglishWordWithHint hoàn thành trước
    const hintResults = await setEnglishWordWithHint(keyword);
    
    // Sau đó mới gọi getNewWordInformation
    const newWordResults = await getNewWordInformation(DATA_SERVER_WORD_INFORMATION + keyword);
    
    // Hiển thị kết quả nếu có
    if (hintResults.length > 0 || (newWordResults && newWordResults.suggestions.length > 0)) {
      $("#result_list").show();
      $("#scroll_word").show();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function setEnglishWordWithHint(keyword) {
  var url = DATA_SERVER_GET_EXACT_WORD_ENGLISH + keyword;
  return $.getJSON(url).then(function(dataFromServer) {
    var datalist = dataFromServer.data;
    var detail;
    var markup;
    // Thêm class để đánh dấu kết quả từ hint
    for (let i = 0; i < datalist.length; i++) {
      detail = datalist[i];
      markup = "<tr class='hint-result' onclick='tdclickDBindex(" + detail['id'] + ");'><td>" + detail['word'] + "-->" + "</td><td>" + detail['note'] + "</td></tr>";
      $('#myTable > tbody:first').append(markup); // Thêm vào đầu bảng
    }
    return datalist;
  });
}

function getNewWordInformation(url) {
  return $.getJSON(url).then(function(dataFromServer) {
    // Store the data in the global variable
    globalDataFromServer = dataFromServer;
    var datalistLen = dataFromServer.suggestions.length;
    var phonetic, definition, keyword;
    var markup;

    // Thêm class để đánh dấu kết quả từ từ điển
    for (let i = 0; i < datalistLen; i++) {
      phonetic = extractPhonetic(dataFromServer, i);
      definition = extractDefinition(dataFromServer, i);
      keyword = getKeyword(dataFromServer, i);
      markup = "<tr class='dictionary-result' onclick='clickWordInformationIndex(\"" + i + "\");'><td>" + keyword + "</td><td>" + definition + "</td></tr>";
      $('#myTable > tbody').append(markup); // Thêm vào cuối bảng
    }
    return dataFromServer;
  });
}

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

function searchWord(wordtype =0){
    var obj=getSearchParam(wordtype);
    var url = DATA_SERVER_GET + '?'+ $.param(obj);
    setClearWordList();
    setWordList(url);
}


function getSearchParam(default_wordtype){
    var obj=new Object();
    var keyword =$("#input_keyword").val();
    var type = default_wordtype;
    var obj=new Object();
    if(type == TYPE_KANJI){
      obj.search_kanji = keyword;
    }else{
      obj.search = keyword;
    }
    obj.type = type;
    return obj;
}

function setWordListWithDBindex(url){
    if(!IS_THERE_MORE_DATA){
      return;
    }
  $.getJSON(url, function(dataFromServer){
    var detail ;
    var markup;
    if(jQuery.isEmptyObject(dataFromServer.data)){
      IS_THERE_MORE_DATA=false;
      return;
    }
    var datalist = dataFromServer.data;
    for (let i = 0; i < datalist.length; i++) {
      detail = datalist[i];
      markup = "<tr onclick='tdclickDBindex("+detail['id']+");'><td>" + detail['word'] + "</td><td>" + detail['note'] + "</td></tr>";
      $('#myTable > tbody:last-child').append(markup); 
    }
  });
}

function loadMoreword(){
    CURRENT_PAGE+=1;
    var obj=getSearchParamWithPage(CURRENT_PAGE);
    var url = DATA_SERVER_GET + '?'+ $.param(obj);
    setWordListWithDBindex(url);
}

function getSearchParamWithPage(pagenum){
    var obj=new Object();
    var keyword =$("#input_keyword").val();
    var obj=new Object();
    obj.search = keyword;
    obj.book = CURRENT_UNIT;
    obj.page = pagenum;
    return obj;
}

function setClearWordList(){
    $("#myTable > tbody").empty();
    CURRENT_PAGE=0;
    IS_THERE_MORE_DATA = true;
  // hide comments area when clearing/searching
  $("#commentsCollapse").hide();
}

function setUnit(){
    var url = DATA_SERVER_GET_UNITS;
    $.getJSON(url, function(dataFromServer){
      units=dataFromServer.data
      addUnitButtons(units);
    });
}

function addUnitButtons(units){
    var detail ;
    var markup;
    for (let i = 0; i < units.length; i++) {
      detail = units[i];
      markup = "<button value='"+detail['code']+"' class='unit' onclick='selectUnit(this);'>"+detail['namevn']+"</button>"
        $("#unitsList").append(markup);
    }
}

function showWordList(){
  $("#scroll_word").show();
  $("#unitsList").hide();
  $("#myTable").show();
  // toggle button styles
  $("#btnShowWords").addClass('active').removeClass('inactive');
  $("#btnShowUnits").removeClass('active').addClass('inactive');
}

function loadAudio(audioName){
    document.getElementById("my-audio").setAttribute('src', audioName);
    var myAudio = document.getElementById("my-audio");
    myAudio.play();
    updateAudioPlayerTitle(audioName);
}

function updateAudioPlayerTitle(audioName) {
    var titleEl = document.getElementById("audio-player-title");
    if (!titleEl) {
      return;
    }

    var displayTitle = "";
    var rows = document.querySelectorAll("#word_table tr");
    for (var i = 0; i < rows.length; i++) {
      var onclickValue = rows[i].getAttribute("onclick") || "";
      if (onclickValue.indexOf(audioName) !== -1) {
        var cells = rows[i].querySelectorAll("td");
        if (cells.length >= 2) {
          var lesson = (cells[0].textContent || "").trim();
          var section = (cells[1].textContent || "").trim();
          displayTitle = lesson + " - " + section;
        }
        break;
      }
    }

    titleEl.textContent = displayTitle || "Audio Player";
}

document.addEventListener("DOMContentLoaded", function() {
  var audioEl = document.getElementById("my-audio");
  if (!audioEl) {
    return;
  }

  var currentSrc = audioEl.getAttribute("src");
  if (!currentSrc) {
    var sourceEl = audioEl.querySelector("source");
    currentSrc = sourceEl ? sourceEl.getAttribute("src") : "";
  }

  if (currentSrc) {
    updateAudioPlayerTitle(currentSrc);
  }
});

function showUnits(){
  $("#scroll_word").show();
  $("#myTable").hide();
  $("#unitsList").show();
  // toggle button styles
  $("#btnShowUnits").addClass('active').removeClass('inactive');
  $("#btnShowWords").removeClass('active').addClass('inactive');
}

function selectUnit(obj){
    CURRENT_UNIT=obj.value;
    setClearWordList();
    loadMoreword();
    if($(window).width() <= 570){
      $("#scroll_word").show();
    }
    $("#unitLabel").text(obj.innerHTML);
    $("#unitLabelMobile").text(obj.innerHTML);
    // After selecting a unit, show the word list and update button states
    showWordList();
    $("#unitsList").hide();
}

function submitWord(wordtype){
    var wordContent;
    var readingContent;
    var noteContent;
    var meaningContent;
    var typeContent;
    var kunContent;
    var onContent;
    var childContent;
    wordContent= $("#myword").val();
    readingContent= $("#myreading").val();
    meaningContent= $("#mymeaning").val();
    noteContent= $("#mynote").val();
    typeContent= wordtype;
    kunContent=$("#mykun").val();
    onContent=  $("#myon").val();
    childContent = $("#mychild").val();
    created_byContent = $("#myname").val();
    var pos = $("#mypartofspeech").length ? $("#mypartofspeech").val() : "";
    
    $.post( DATA_SERVER_POST_WORD, { word: wordContent, reading:readingContent, note:noteContent, meaning: meaningContent, type:typeContent, kun:kunContent, on: onContent, created_by: created_byContent,child: childContent,pos: pos })
    .done(function( data ) {

    });
    showThankYouAlert();
}

function showThankYouAlert() {
  alert("Bạn ơi! Cám ơn bạn vì đã đóng góp nhé!");
}

function setButtonDisable(){
    if($("#myword").val().length >= 1 && $("#myreading").val().length >= 1 && $("#mymeaning").val().length >= 1  ){
      $('#submitButton').prop('disabled', false);
    }else{
      $('#submitButton').prop('disabled', true);
    }
}

function ignoreEnter(){
    document.getElementById("myForm").onkeypress = function(e) {
      var key = e.charCode || e.keyCode || 0;     
      if (key == 13) {
        e.preventDefault();
      }
    }
}

function updateAudio(audioName){
    //change text
    $("#listeningfile").text(audioName);
    //set audio
    document.getElementById("my-audio").setAttribute('src', audioName);
    var myAudio = document.getElementById("my-audio");
    myAudio.play();
}

function getHintForWord(wordtype) {
    var phonetic = $("#myreading").val();
    if (!phonetic) {
      return;
    }
    var url = getHintURLBaseOnSelectedLanguage(wordtype) + phonetic;
    $.getJSON(url, function(dataFromServer) {
      var hintArray = dataFromServer.data;
      showHint(hintArray);
    }).fail(function() {
      console.error("Error fetching hint data from API");
    });
}

function getHintURLBaseOnSelectedLanguage(wordtype) {
    if (wordtype === TYPE_ENGLISH) {
      return DATA_SERVER_GET_HINT_ENGLISH;
    } else {
      return DATA_SERVER_GET_HINT_JAPANESE;
    }
}

function showHint(hintArray) {
  const flattenedArray = hintArray.flat();
  const columns = splitIntoColumns(flattenedArray);
  columns.forEach((column, index) => {
    const div = document.getElementById(`hint_text_${index + 1}`);
    if (div) {
      div.innerHTML = column.join("<br>");
    }
  });
}

function splitIntoColumns(arr) {
  const isMobile = window.innerWidth <= 767;
  const totalItems = arr.length;
  const columnCount = isMobile ? 2 : 4;
  const columnSize = Math.ceil(totalItems / columnCount);
  const result = Array.from({ length: columnCount }, () => []);
  for (let i = 0; i < totalItems; i++) {
    const colIndex = Math.floor(i / columnSize);
    result[colIndex].push(arr[i]);
  }
  return result;
}

function searchWordJapanese(){
    searchWord(TYPE_JAPANESE);
}

function searchWordKanji(){
    searchWord(TYPE_KANJI);
}

function searchWordEnglish(){
    searchWord(TYPE_ENGLISH);
}

function inputKeywordListenerJapanese(){
    inputKeywordListener(TYPE_JAPANESE);
}

function inputKeywordListenerKanji(){
    inputKeywordListener(TYPE_KANJI);
}

function inputKeywordListenerEnglish(){
    inputKeywordListener(TYPE_ENGLISH);
}

function getHintForWordJapanese() {
    getHintForWord(TYPE_JAPANESE);
}

function getHintForWordEnglish() {
    getHintForWord(TYPE_ENGLISH);
}

// Thêm CSS để phân biệt 2 loại kết quả
function addCustomStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .hint-result {
      background-color: rgba(9, 110, 235, 0.1);
    }
    .dictionary-result {
      background-color: white;
    }
    .hint-result:hover, .dictionary-result:hover {
      background-color: rgba(9, 110, 235, 0.2);
    }
  `;
  document.head.appendChild(style);
}

// Gọi hàm thêm CSS khi trang được load
document.addEventListener('DOMContentLoaded', addCustomStyles);
function saveMyName(name) {
  localStorage.setItem('myname', name);
}

function loadMyName() {
  return localStorage.getItem('myname') || '';
}

// Hàm lấy từ trước đó từ bảng từ vựng
function getPreviousWord() {
  var prevWordId = parseInt($("#word_prev").text());
  tdclickDBindex(prevWordId);
}

// Hàm lấy từ tiếp theo từ bảng từ vựng
function getNextWord() {
    var nextWordId = parseInt($("#word_next").text());
    tdclickDBindex(nextWordId);
}