var gridSize = 5;

//Draw the grid/map
function drawGrid(){
    var i = 1;
    while (i < gridSize){
        var j = 1;
        while (j < gridSize){
            canvasContext.strokeStyle= "black";
            canvasContext.strokeRect((i-1)*100,(j-1)*100,200,200);
            j = j+1
        }
        i = i+1;
    }
}