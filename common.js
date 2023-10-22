var DATA_SERVER_GET = "https://nguyenthithom.name.vn/api/chars";
var DATA_SERVER_GET_UNITS = "https://nguyenthithom.name.vn/api/units";
var DATA_SERVER_IMAGE = "https://nguyenthithom.name.vn/wordImage/";
var DATA_SERVER_POST_COMMENT = "https://nguyenthithom.name.vn/api/chars/";
var DATA_SERVER_POST_WORD = "https://nguyenthithom.name.vn/api/chars";
var DATA_SERVER_POST_COMMENT_SUFFIX = "/comment";
var CURRENT_UNIT ="MINA1";
var CURRENT_PAGE = 0;
var IS_THERE_MORE_DATA = true;
var table = document.getElementById("myTable");
const TYPE_KANJI =1;
const TYPE_NEWWORD =0;



function setScrollEvent(){
    var currentScrollHeight =0;
    var documentHeight =$(document).height();
    $("#scroll_word").scroll(function() {
          
        if($(this).scrollTop() + $(this).innerHeight()+1 >= $(this)[0].scrollHeight) {
          loadMoreword(); 
        } 
    });
  };
  function setIndicator(){
    $(document).ajaxStart(function(){
      $("#wait").css("display", "block");
      });
      $(document).ajaxComplete(function(){
      $("#wait").css("display", "none");
      });
  };

  function setWordComment(singleWord){
    var detail;
    var comment_list=new Object;
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
      var DEFAULT_AUTHOR ="メンバー"
      currentWordID= $("#word_id").text();
      commentContent= $("#mycomment").val();
      commentUrl= DATA_SERVER_POST_COMMENT + currentWordID +DATA_SERVER_POST_COMMENT_SUFFIX;
      $.post( commentUrl, { author_name: DEFAULT_AUTHOR, content:commentContent})
      .done(function( data ) {
        $("#mycomment").val("");

        markup = "<tr><td>" + commentContent + "</td><td>" + DEFAULT_AUTHOR + "</td></tr>";
        $('#table_comment > tbody:last-child').append(markup); 
      });

   
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
      
  };

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
  };

  function inputKeywordListener(){
    //Delaying the function execute
    if (this.timer) {
      window.clearTimeout(this.timer);
    }
    this.timer = window.setTimeout(function() {

      searchWord();

    }, 500);
    
  };


  function searchWord(){
    var obj=getSearchParam();
    var url = DATA_SERVER_GET + '?'+ $.param(obj);
    setClearWordList();
    setWordList(url);
  };

  function getSearchParam(){
    var obj=new Object();

    var keyword =$("#input_keyword").val();
    var type =$("#combo").val();
    var obj=new Object();
    if(type == TYPE_KANJI){
      obj.search_kanji = keyword;
    }else{
      obj.search = keyword;
    }
    
    obj.type = type;

    return obj;
  };


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
  };
  function loadMoreword(){
    CURRENT_PAGE+=1;
    var obj=getSearchParamWithPage(CURRENT_PAGE);
    var url = DATA_SERVER_GET + '?'+ $.param(obj);
    setWordListWithDBindex(url);
  };
  function getSearchParamWithPage(pagenum){
    var obj=new Object();
    var keyword =$("#input_keyword").val();
    var obj=new Object();
    obj.search = keyword;
    obj.book = CURRENT_UNIT;
    obj.page = pagenum;
    return obj;
  };
  function setClearWordList(){
    $("#myTable > tbody").empty();
    CURRENT_PAGE=0;
    IS_THERE_MORE_DATA = true;
  };

  function getNextWord(){
    var idText=$("#word_next").text();
    var nextID=parseInt( idText );
    getWordFromDB(nextID);
  }

  function getPreviousWord(){
    var idText=$("#word_prev").text();
    var nextID=parseInt( idText );
    if(nextID>0){
      getWordFromDB(nextID);
    }
    
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
      markup = "<button  value='"+detail['code']+"'  class='btn btn-outline-secondary btn-sm unit' onclick='selectUnit(this);' >"+detail['namevn']+"</button>"
        $("#unitsList").append(markup);
    }
  }
  
  function showWordList(){
    $("#scroll_word").show();
    $("#unitsList").hide();
    $("#myTable").show();
  }

  function loadAudio(audioName){
    document.getElementById("my-audio").setAttribute('src', audioName);
    var myAudio = document.getElementById("my-audio");
    myAudio.play();
  }

  function showUnits(){
    $("#scroll_word").show();
    $("#myTable").hide();
    $("#unitsList").show();
  }


  function selectUnit(obj){
    CURRENT_UNIT=obj.value;
    setClearWordList();
    loadMoreword();
    if($(window).width() <= 570){
      $("#scroll_word").show();
    }

    $("#unitLabel").text(obj.innerHTML);
    $("#unitsList").hide();
    $("#myTable").show();
  }


  function submitWord(){
    var wordContent;
    var readingContent;
    var noteContent;
    var meaningContent;
    var typeContent;
    var kunContent;
    var onContent;
    wordContent= $("#myword").val();
    readingContent= $("#myreading").val();
    meaningContent= $("#mymeaning").val();
    noteContent= $("#mynote").val();
    typeContent= $("#mytype").val();
    kunContent=$("#mykun").val();
    onContent=  $("#myon").val();
    
    $.post( DATA_SERVER_POST_WORD, { word: wordContent, reading:readingContent, note:noteContent, meaning: meaningContent, type:typeContent, kun:kunContent, on:onContent})
    .done(function( data ) {
      $("#mycomment").val("");
      $("#myreading").val("");
      $("#mymeaning").val("");
      $("#mynote").val("");
      $("#mykun").val("");
      $("#myon").val("");
      
    });
    alert("Bạn ơi! Cám ơn bạn vì đã đóng góp nhé!");
}

function setwordtype(selectedtype){
  var type;
  type = selectedtype.value;

  if(type==TYPE_KANJI){
    $("#mywordlabel").text("Hán tự 漢字");
    $("#myreadinglabel").text("Phiên âm Hán Việt");
    $("#myword").attr("placeholder", "日");
    $("#myreading").attr("placeholder", "NHẬT");
    $("#kun").show();
    $("#on").show();
  }else{
    $("#mywordlabel").text("Từ Vựng( Viết bằng Chữ hán hoặc Hiragana)");
    $("#myreadinglabel").text("Cách đọc( Viết bằng Hiragana)");
    $("#myword").attr("placeholder", "漢字で入力");
    $("#myreading").attr("placeholder", "ひらがなでにゅうりょく");
    $("#kun").hide();
    $("#on").hide();
  }
}

function setButtonDisable(){
  if($("#myword").val().length >= 1 && $("#myreading").val().length >= 1 && $("#mymeaning").val().length >= 1  ){
    $('#submitButton').prop('disabled', false);
  }else{
    $('#submitButton').prop('disabled', true);
  }
}