function drawCars(){
    var socket = io();
    socket.on('DumbCarArray',function(data){
      console.log(data);
      for (var i = 0; i < data.length; i++) {
        primaryCtx.fillStyle = data[i].carColour;
        primaryCtx.fillRect(data[i]._xPos*100,data[i]._yPos*100,30,20);
      }
    });
}
