(function($){

    var components = {
        viewHtml : '#viewHtml',
        postHtml : '#postHtml',
        htmlContent : '#htmlContent',
        htmlMarker : '#htmlMarker'
    }

    var memory = {
        htmlJson : undefined
    }

    $(document).ready(function() {
        view.attach();
        model.fetchHtmlContent();
        highlight.init();
    });

    var view = {
        attach : function(){
            $(components.resetHtml).click(view.resetHtml);
            $(components.postHtml).click(model.saveHtmlContent);
            $(components.htmlMarker).click(view.marker);
        },
        resetHtml : function(){
            $( components.htmlContent ).html( memory.htmlJson.content );
        },
        marker : function(){
            highlight.memory.dragging = !(highlight.memory.dragging);
            var buttom = $(components.htmlMarker);
            if (highlight.memory.dragging)
            {
                buttom.removeClass('btn-primary');
                buttom.addClass('btn-warning');
            }
            else
            {
                buttom.addClass('btn-primary');
                buttom.removeClass('btn-warning');
            }
        }
    }

    var model = {
        fetchHtmlContent : function(){
            $.get( "./json/html.json", function( data ) {
                memory.htmlJson = data;
                view.resetHtml();
            });
        },
        saveHtmlContent : function(){
            $.ajax({
                type: "POST",
                url: './json/save',
                data: model.dataToSave(),
                success: function(response){
                    console.log("salvo");
                },
                dataType: 'json'
            });
        },
        dataToSave : function(){
            return {
                newContent : $(components.htmlContent).html()
            }
        }
    }

    this.highlight = {

        memory : {
            selection : undefined,
            element : undefined,
            textSelected : undefined,
            start : -1,
            end : -1,
            dragging : false
        },
        init : function(){
            $(components.htmlContent).mouseup(highlight.mouseup);
        },
        mouseup : function(e){
            if (highlight.memory.dragging)
            {
                highlight.memory.selection = window.getSelection();
                highlight.memory.element = highlight.memory.selection.focusNode.parentElement; 
                highlight.memory.start = highlight.memory.selection.anchorOffset;
                highlight.memory.end = highlight.memory.selection.extentOffset;
                highlight.memory.textSelected = highlight.memory.selection.focusNode.nodeValue;
                highlight.fixStartEnd();
                highlight.paintElement();
            }
        },
        fixStartEnd : function(){
            if (highlight.memory.start > highlight.memory.end){
                var start = highlight.memory.start;
                highlight.memory.start = highlight.memory.end;
                highlight.memory.end = start;
            }
        },
        paintElement : function(){
            if (highlight.memory.element){
                var elem = $(pintellectPage.highlight.memory.element);
                var newhtml = highlight.preffixText(elem) +
                    "<span class='high'>" + highlight.cleanedText(elem) + "</span>" +
                    highlight.suffixText(elem);
                elem.html( elem.html().replace(highlight.memory.textSelected, newhtml));
            }
        },
        preffixText : function(elem){
            return highlight.memory.textSelected.substr(0, pintellectPage.highlight.memory.start);
        },
        suffixText : function(elem){
            return highlight.memory.textSelected.substr(pintellectPage.highlight.memory.end, highlight.memory.textSelected.length);
        },
        cleanedText :function(elem){
            var text = highlight.memory.textSelected.substr(pintellectPage.highlight.memory.start, pintellectPage.highlight.memory.end - pintellectPage.highlight.memory.start);
            text = text.replace("<span class='high'>","");
            text = text.replace("</span>","");
            return text;
        }
    }


    view.resetHtml = view.resetHtml.bind(this);
    model.fetchHtmlContent = model.fetchHtmlContent.bind(this);
    model.saveHtmlContent = model.saveHtmlContent.bind(this);
    model.dataToSave = model.dataToSave.bind(this);
    highlight.init = highlight.init.bind(this);

    window.pintellectHtmlPage = this;


}(jQuery));