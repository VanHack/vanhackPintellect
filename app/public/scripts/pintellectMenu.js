(function($){

    var components = {
        showHtml : '#showHtml',
        showPdf : '#showPdf',
        headerHtml : '#headerHtml',
        headerPdf : '#headerPdf',
        viewHtml : '#viewHtml',
        viewPdf : '#viewPdf'
    }

    var memory = {
    }

    $(document).ready(function() {
        view.attach();
    });

    var view = {
        attach : function(){
            $(components.showHtml).click(view.showHtml);
            $(components.showPdf).click(view.showPdf);            
        },
        showHtml : function(){
            $(components.headerHtml).removeClass('hide');
            $(components.viewHtml).removeClass('hide');
            $(components.viewPdf).addClass('hide');
            $(components.headerPdf).addClass('hide');
        },
        showPdf : function(){
            $(components.headerHtml).addClass('hide');
            $(components.viewHtml).addClass('hide');
            $(components.viewPdf).removeClass('hide');
            $(components.headerPdf).removeClass('hide');
        }
    }

    view.showHtml = view.showHtml.bind(this);
    view.showPdf = view.showPdf.bind(this);
    
}(jQuery));