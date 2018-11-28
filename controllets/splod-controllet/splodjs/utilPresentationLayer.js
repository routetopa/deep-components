function highlightElementsToRemove(){
	var IDtoRemove = $('.highlighted').attr('meta-removereference');

	if(IDtoRemove != undefined){
        document.getElementById(IDtoRemove).parentNode.className += ' highlightRemove';

		var spanToRemove = document.getElementById(IDtoRemove).parentNode.querySelectorAll('span');
		$.each(spanToRemove, function(index){
			spanToRemove[index].className += ' highlightRemove';
		});

	}else{
        console.log("This element has no meta-removereference");
    }
}

function removeHighlightElementsToRemove(){
	var toRemoveHightlight = $('.highlightRemove');

	$.each(toRemoveHightlight, function(index){
		toRemoveHightlight[index].setAttribute('class', toRemoveHightlight[index].getAttribute('class').replace(' highlightRemove', ''));
	});
}

jQuery.expr[':'].Contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};

function filter(inputName, boxName, extraSearch) {
    var filter, li, liContent, text;

    filter = $('#'+inputName).val();
    li = $('#'+boxName+" li");
    liContent = $('#'+boxName+" .liContent");

    for (var i = 0; i < li.length; i++) {
        text = liContent[i].innerText;
        if (text.toLowerCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }

    if(extraSearch){
        if($('#'+boxName+" li:visible").length == 0){
            fillBoxByKeyword(inputName, filter);   
        }
    }

}

function isImage(url){
    return ((url.toLowerCase()).match(/^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png|svg)/)!=null);
}