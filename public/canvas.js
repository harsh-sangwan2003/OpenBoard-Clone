let canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColorCont = document.querySelectorAll('.pencil-color');
let pencilWidthEle = document.querySelector('.pencil-width');
let eraserWidthEle = document.querySelector('.eraser-width');
let download = document.querySelector('.download');
let redo = document.querySelector('.redo');
let undo = document.querySelector('.undo');

let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthEle.value;
let eraserWidth = eraserWidthEle.value;

let mouseDown = false;
let tool = canvas.getContext("2d");
let undoRedoTracker = [];
let track = 0;

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

canvas.addEventListener("mousedown", e => {

    mouseDown = true;

    let data = {

        x: e.clientX,
        y: e.clientY
    }
    socket.emit("beginPath", data);
})

canvas.addEventListener("mousemove", e => {

    if (mouseDown) {

        let data = {
            x: e.clientX,
            y: e.clientY,
            color: eraserFlag ? eraserColor : penColor,
            width: eraserFlag ? eraserWidth : penWidth
        };

        socket.emit("drawStroke", data);
    }

})

canvas.addEventListener("mouseup", e => {

    mouseDown = false;

    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length - 1;
})

undo.addEventListener("click", e => {

    if (track > 0) track--;

    let trackObj = {

        trackValue: track,
        undoRedoTracker
    }

    socket.emit("redoUndo", trackObj);
})

redo.addEventListener("click", e => {

    if (track < undoRedoTracker.length - 1) track++;

    let trackObj = {

        trackValue: track,
        undoRedoTracker
    }

    socket.emit("redoUndo", trackObj);
})

function undoRedoCanvas(trackObj) {

    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;

    let url = undoRedoTracker[track];

    let img = new Image();
    img.src = url;
    img.onload = (e) => {

        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

function beginPath(strokeObj) {

    tool.beginPath();
    tool.moveTo(strokeObj.x, strokeObj.y);
}

function drawStroke(strokeObj) {

    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();

}

pencilColorCont.forEach(colorEle => {

    colorEle.addEventListener("click", e => {

        let color = colorEle.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;
    })
})

pencilWidthEle.addEventListener("change", e => {

    penWidth = pencilWidthEle.value;
    tool.lineWidth = penWidth;
})

eraserWidthEle.addEventListener("change", e => {

    eraserWidth = eraserWidthEle.value;
    tool.lineWidth = eraserWidth;
})

eraser.addEventListener("click", e => {

    if (eraserFlag) {

        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    }

    else {

        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
    }
})

download.addEventListener("click", e => {

    let url = canvas.toDataURL();

    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

socket.on("beginPath", (data) => {

    beginPath(data);
})

socket.on("drawStroke", data => {

    drawStroke(data);
})

socket.on("redoUndo", data => {

    undoRedoCanvas(data);
})