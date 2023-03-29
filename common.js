var datalist;
var DATA_SERVER_GET = "https://nguyenthithom.name.vn/api/chars";
var DATA_SERVER_POST_COMMENT = "https://nguyenthithom.name.vn/api/chars/word_id/comment";
var table = document.getElementById("myTable");


$(document).ready(function(){
  setWordList(DATA_SERVER_GET);
  setIndicator();
});

  function setWordComment(singleWord){
    var detail;
    var comment_list=new Object;
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
  };

  function setWordDetail(singleWord){
    $("#word_id").val(singleWord['id']);
      $("#word_text").text(singleWord['word']);
      $("#word_reading").text(singleWord['reading']);
      $("#word_meaning").text(singleWord['meaning']);
      $("#word_note").text(singleWord['note']);
  };

  function setWordList(url){
  $.getJSON(url, function(dataFromServer){
    datalist = dataFromServer.data;
    var detail ;
    var markup;
    for (let i = 0; i < datalist.length; i++) {
      detail = datalist[i];
      markup = "<tr onclick='tdclick("+i+");'><td>" + detail['word'] + "</td><td>" + detail['meaning'] + "</td></tr>";
      $('#myTable > tbody:last-child').append(markup); 
    }
  });
  };

  function searchWord(){
    var obj=getSearchParam();
    var url = DATA_SERVER_GET + '?'+ $.param(obj);
    setWordListClean();
    setWordList(url);
  };

  function getSearchParam(){
    var obj=new Object();

    var keyword =$("#input_keyword").val();
    var type =$('#combo :selected').val();
    var obj=new Object();
    obj.search = keyword;
    obj.type = type;

    return obj;
  };


  function setWordListClean(){
    $("#myTable > tbody").empty();
  }