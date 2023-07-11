var datalist;
var DATA_SERVER_GET = "https://nguyenthithom.name.vn/api/chars";
var DATA_SERVER_IMAGE = "http://nguyenthithom.name.vn/wordImage/";
var DATA_SERVER_POST_COMMENT = "https://nguyenthithom.name.vn/api/chars/word_id/comment";
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
  function setClickEventForUnitButton(){
    $('.unit').click(function () {;
    //make other button gray and highlight selected button
    $('.unit').removeClass('btn-primary');
    $('.unit').addClass('btn-outline-secondary');
    $(this).removeClass('btn-outline-secondary');
    $(this).addClass('btn-primary');
    CURRENT_UNIT=$(this).val();
    setClearWordList();
    loadMoreword();
    if($(window).width() <= 570){
      $("#scroll_word").show();
    }
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


  function trclick(){};

  function tdclick(i){
      var detail =datalist[i];
      setWordDetail(detail);
      setWordComment(detail);
      //in sp, hide the result list
      if($(window).width() <= 570){
        $("#result_list").hide();
      }
  };
  function tdclickDBindex(wordID){
    getWordFromDB(wordID);
    if($(window).width() <= 570){
      $("#scroll_word").hide();
    }
  };

  function getWordFromDB(wordID){
    var url = DATA_SERVER_GET + '/'+ wordID;
    $.getJSON(url, function(dataFromServer){
      word=dataFromServer.data
      setWordDetail(word);
      setWordComment(word);
    });
  }
  function setWordDetail(singleWord){
    $("#word_id").text(singleWord['id']);
    $("#word_text").text(singleWord['word']);
    $("#word_reading").text(singleWord['reading']);
    $("#word_meaning").text(singleWord['meaning']);
    $("#word_note").text(singleWord['note']);
    $("#word_kun").text(singleWord['kun']);
    $("#word_on").text(singleWord['on']);

    if(singleWord['image'] !=null){
      $('#word_image').attr("src", DATA_SERVER_IMAGE + singleWord['image'] );
    }else{
      $('#word_image').attr("src", "image/default.jpg" );
    }
      
  };

  function setWordList(url){
  $.getJSON(url, function(dataFromServer){
    datalist = dataFromServer.data;
    var detail ;
    var markup;
    for (let i = 0; i < datalist.length; i++) {
      detail = datalist[i];
      markup = "<tr onclick='tdclick("+i+");'><td>" + detail['word'] + "</td><td>" + detail['note'] + "</td></tr>";
      $('#myTable > tbody:last-child').append(markup); 
    }
    if(datalist.length>0){
      $("#result_list").show();
      $("#scroll_word").show();
    }
    
  });
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
    datalist = dataFromServer.data;
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
    var idText=$("#word_id").text();
    var nextID=parseInt( idText )+1;
    getWordFromDB(nextID);
  }

  function getPreviousWord(){
    var idText=$("#word_id").text();
    var nextID=parseInt( idText )-1;
    if(nextID>0){
      getWordFromDB(nextID);
    }
    
  }