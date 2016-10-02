$(function(){
    var url = 'http://localhost:3000';

    // cache de objetos de Jquery
    var doc = $(document);
    var win = $(window);
    var canvas = $("#paper");
    var instructions = $("#instructions");
    var ctx = canvas[0].getContext('2d');

    // id unico para la session
    var id = Math.round($.now()*Math.random());

    // inicializamos el estado
    var drawing = false;
    var clients = {};
    var cursors = {};
    var prev = {};
    var lastEmit = $.now();
    var cursorColor = randomColor();

    // abrimos la conexion
    var socket = io.connect(url);

    socket.on('move', moveHandler);
    canvas.on('mousedown', mousedownHandler);
    doc.on('mousemove', mousemoveHandler);

    doc.bind('mouseup mouseleave', function () {
       drawing = false; 
    });

    setInterval(function () {
        for(var ident in clients) {
            if( $.now() - clients[ident].updated > 10000 ) {
                cursors[ident].remove();
                delete clients[ident];
                delete cursors[ident];
            }
        }
    }, 10000);

    function drawLine (fromx, fromy, tox, toy) {
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
    }

    function mousedownHandler (e) {
        e.preventDefault();
        drawing = true;
        prev.x = e.pageX;
        prev.y = e.pageY;

        // escondemos las instrucciones
        instructions.fadeOut();
    }

    function mousemoveHandler (e) {
        if( $.now() - lastEmit > 30 ) {
            var movement = {
                'x': e.pageX,
                'y': e.pageY,
                'drawing': drawing,
                'color': cursorColor,
                'id': id
            };
            socket.emit('mousemove', movement);
            lastEmit = $.now();
        }

        if( drawing ) {
            drawLine(prev.x, prev.y, e.pageX, e.pageY);
            prev.x = e.pageX;
            prev.y = e.pageY;
        }
    }

    function moveHandler (data) {
        if( !(data.id in clients) ) {
            // le damos un cursor a cada usuario nuestro
            cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
        }

        // movemos el cursor a su posicion
        cursors[data.id].css({
           'left': data.x,
            'top': data.y
        });

        if( data.drawing && clients[data.id] ) {
            drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
        }

        // actualizamos el estado
        clients[data.id] = data;
        clients[data.id].updated = $.now();
    }
    
    function randomColor () {
        return '#'+(function lol(m,s,c){return s[m.floor(m.random() * s.length)] + (c && lol(m,s,c-1));})(Math,'0123456789ABCDEF',4);
    }
});
