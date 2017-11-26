(function($){

    var components = {
        viewHtml : '#viewHtml',
        postHtml : '#postHtml',
        theCanvas : '#theCanvas',
        canvasPaintLayer : '#canvasPaintLayer',
        buttons : {
            pdfPrev : '#pdfPrev',
            pdfNext :'#pdfNext',
            pdfMarker : '#pdfMarker'
        },
        cursors : {
            cursorMarker : '#cursorMarker'
        }
    }

    var memory = {
        htmlJson : undefined
    }

    $(document).ready(function() {
        view.attach();
        model.fetchPdfContent();
    });

    var view = {
        attach : function(){
            $(components.resetHtml).click(view.resetHtml);
            $(components.postHtml).click(model.saveHtmlContent);
            
            pdfView.init();
            pdfView.attach();
        },
        resetHtml : function(){
            $( components.viewHtml ).html( memory.htmlJson.content );
        },
        keepScroll : function(){
        }
    }

    var model = {
        fetchPdfContent : function(){
            $.get( "./json/pdf.json", function( data ) {
                pdfInstallation.init(data.url);
            });
        },
        saveHtmlContent : function(){
        },
        dataToSave : function(){
        }
    }

    this.pdfInstallation = {
        memory : {
            pdfTask : undefined,
            maxPages : undefined,
            currentPage : undefined
        },
        init : function(url){
            PDFJS.workerSrc = './scripts/pdf.worker.min.js';
            var loadingTask = PDFJS.getDocument(url);
            loadingTask.promise.then(function(pdf) {
                pdfInstallation.memory.pdfTask = pdf;
                pdfInstallation.memory.maxPages = pdf.numPages;
                console.log('PDF loaded');
                pdfInstallation.renderPage(1);
            }, function (reason) {
                // PDF loading error
                console.log(reason);
            });
        },
        renderPage : function(pageNumber){
            pdfInstallation.memory.currentPage = pageNumber;
            pdfInstallation.memory.pdfTask.getPage(pageNumber).then(pdfInstallation.render);
        },
        render : function(page) {
            console.log('Page loaded');
            
            var scale = 1.5;
            var viewport = page.getViewport(scale);

            // Prepare canvas using PDF page dimensions
            var canvas = $(components.theCanvas)[0];
            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            var canvasPaintLayer = $(components.canvasPaintLayer)[0];
            canvasPaintLayer.height = viewport.height;
            canvasPaintLayer.width = viewport.width;
            pdfView.memory.canvasWidth = viewport.width;


            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);
            renderTask.then(function () {
                console.log('Page rendered');
            });
        }

    }

    this.pdfView = {

        memory : {
            selection : undefined,
            element : undefined,
            textSelected : undefined,
            start : -1,
            end : -1,
            canvasPaintContext : undefined,
            canvasPaintData : undefined,
            canvasWidth : undefined
        },
        attach : function(){
            $(components.buttons.pdfPrev).click(pdfView.prev);
            $(components.buttons.pdfNext).click(pdfView.next);
            $(components.buttons.pdfMarker).click(pdfView.marker);
        },
        init : function(){
            var canvas = $(components.canvasPaintLayer)[0];
            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;
            pdfView.memory.canvasPaintContext = canvas.getContext("2d");
            pdfView.memory.canvasPaintData = pdfView.memory.canvasPaintContext.getImageData(0, 0, canvasWidth, canvasHeight);

        },
        next : function(){
            var nextPage = pdfInstallation.memory.currentPage + 1;
            if (nextPage <= pdfInstallation.memory.maxPages)
                pdfInstallation.renderPage(nextPage);
        },
        prev : function(){
            var prevPage = pdfInstallation.memory.currentPage - 1;
            if (prevPage >= 0)
                pdfInstallation.renderPage(prevPage);
        },
        marker : function(){
            pdfView.pdfMarker.memory.$markerSpan = $(components.cursors.cursorMarker);
            pdfView.pdfMarker.memory.vanillaMarkerSpan = pdfView.pdfMarker.memory.$markerSpan[0];
            pdfView.pdfMarker.memory.enable = !(pdfView.pdfMarker.memory.enable);
            if (pdfView.pdfMarker.memory.enable)
            {
                pdfView.pdfMarker.enable();
            }
            else
            {
                pdfView.pdfMarker.disable();
            }
        },
        pdfMarker : {
            memory : {
                $markerSpan : undefined,
                vanillaMarkerSpan : undefined,
                enabled : false,
                dragging : false
            },            
            cursorMove : function(e){
                var x = e.clientX,
                y = e.clientY;
                pdfView.pdfMarker.memory.vanillaMarkerSpan.style.top = (y) + 'px';
                pdfView.pdfMarker.memory.vanillaMarkerSpan.style.left = (x) + 'px';
            },
            enable : function(){
                var buttom = $(components.buttons.pdfMarker);
                buttom.removeClass('btn-primary');
                buttom.addClass('btn-warning');
                pdfView.pdfMarker.memory.$markerSpan.removeClass('hide');
                $(components.canvasPaintLayer).bind('mousemove', pdfView.pdfMarker.cursorMove);
                //$(components.canvasPaintLayer).bind('click', pdfView.pdfMarker.dragPencil);
                $(components.cursors.cursorMarker).bind('mousedown', function(){ pdfView.pdfMarker.memory.dragging = true; });
                $(components.cursors.cursorMarker).bind('mouseup', function(){ pdfView.pdfMarker.memory.dragging = false; });
                $(components.cursors.cursorMarker).bind('mousemove', pdfView.pdfMarker.dragPencil);
                $(components.canvasPaintLayer).css('cursor', 'none');
            },
            disable : function(){
                var buttom = $(components.buttons.pdfMarker);
                buttom.removeClass('btn-warning');
                buttom.addClass('btn-primary');
                pdfView.pdfMarker.memory.$markerSpan.addClass('hide');
                $(components.canvasPaintLayer).unbind('mousemove', pdfView.pdfMarker.cursorMove);
                $(components.canvasPaintLayer).css('cursor', 'default');
            },
            dragPencil : function(e){
                if (pdfView.pdfMarker.memory.dragging)
                {
                    var x = e.clientX - 90,
                    y = e.clientY - 70;
                    pdfView.pdfMarker.fillPaint(x, y);
                    pdfView.pdfMarker.updateCanvas();
                }
            },
            fillPaint : function(x, y){
                var ctx = pdfView.memory.canvasPaintContext;
                ctx.beginPath();
                ctx.rect(x, y, 20, 20);
                ctx.fillStyle = 'rgba(250, 250, 0, 0.2)';
                ctx.fill();
                // var index = (x + y * pdfView.memory.canvasWidth) * 4;                
                // pdfView.memory.canvasPaintData.data[index + 0] = r;
                // pdfView.memory.canvasPaintData.data[index + 1] = g;
                // pdfView.memory.canvasPaintData.data[index + 2] = b;
                // pdfView.memory.canvasPaintData.data[index + 3] = a;
            },
            updateCanvas : function(){
                //pdfView.memory.canvasPaintContext.putImageData(pdfView.memory.canvasPaintData, 0, 0);
            }
        },
        mouseup : function(e){
        },
        fixStartEnd : function(){
        },
        paintElement : function(){
        },
        preffixText : function(elem){
        },
        suffixText : function(elem){
        },
        cleanedText :function(elem){
        }
    }


    view.resetHtml = view.resetHtml.bind(this);
    model.fetchPdfContent = model.fetchPdfContent.bind(this);
    model.saveHtmlContent = model.saveHtmlContent.bind(this);
    model.dataToSave = model.dataToSave.bind(this);
    pdfView.init = pdfView.init.bind(this);

    window.pintellectPage = this;


}(jQuery));