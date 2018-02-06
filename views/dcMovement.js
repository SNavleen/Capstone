var map = require('../views/mapCreate.js');
var carCreation = require('./carCreation.js')

carCreation.createDumbCars();
var carArray = carCreation.getCarArr();

// TODO See if io can be assigned to a var to move everything out of the export function
// TODO Clean up code and remove everything out of socket function (only keep socket events)
// TODO Create function to convert speed to km/h as an int

// Calculates the absolute difference between two numbers
var difference = function (a, b) {
    return Math.abs(a - b); 
}

// A function used to round a float number to a specific precision
function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

// Returns an additonal factorial of a given number (used to determine the stopping distance of the car)
var minimumSlowDownDistance = function (currentSpeed) {
    var totalStoppingDistance = 0;
    currentSpeed = precisionRound(currentSpeed, 2);
    
    while(currentSpeed > 0) {
        totalStoppingDistance = precisionRound(currentSpeed + totalStoppingDistance, 2);  
        currentSpeed = precisionRound(currentSpeed - 0.01, 2);
    }
    return totalStoppingDistance;
}

// Function for adjusting cars to specified speed
function adjustSpeed(carID, desiredSpeed) {
    if (carCreation.getCar(carID)._speed < desiredSpeed) {
        carCreation.getCar(carID)._speed = carCreation.getCar(carID)._speed + 0.01;
    }
    else if (carCreation.getCar(carID)._speed > desiredSpeed) {
        carCreation.getCar(carID)._speed = carCreation.getCar(carID)._speed - 0.01;
    }
    return false;
}

// Determines the distance between two cars
function euclideanDistance(currentCarX, currentCarY, checkedCarX, checkedCarY) {
    var xDifference = difference(currentCarX, checkedCarX);
    var yDifference = difference(currentCarY, checkedCarY);
    var distance = Math.sqrt(xDifference * xDifference + yDifference * yDifference);
    return distance;
}

// Checks the distance of the nearest vehicle on a cars current road
function collisionAvoidanceCheck(carID) {
    var currentCar = carCreation.getCar(carID);
    var carsOnEdge = map.getCarsOnEdge(currentCar._currentEdgeID);

    var currentCarX = currentCar._xPos;
    var currentCarY = currentCar._yPos;
    var checkedCarX = 0;
    var checkedCarY = 0;

    var shortestDistance = Number.MAX_SAFE_INTEGER; // resets the distance to max

    // Check against each car currently on edge
    for (var i = 0; i < carsOnEdge.length; i++) {
        // Makes sure not to check itself
        if (currentCar._carID != carsOnEdge[i]._carID) {
            checkedCarX = carsOnEdge[i]._xPos;
            checkedCarY = carsOnEdge[i]._yPos;

            // Only need to check cars with a larger x
            if (currentCar._orientation == 0) {
                if (currentCarX < checkedCarX) {
                    currentDistance = euclideanDistance(currentCarX, currentCarY, checkedCarX, checkedCarY);
                }
            }
            // Only need to check cars with a smaller x
            else if (currentCar._orientation == 180) {
                if (currentCarX > checkedCarX) {
                    currentDistance = euclideanDistance(currentCarX, currentCarY, checkedCarX, checkedCarY);
                }
            }
            // Only need to check cars with a smaller y
            else if (currentCar._orientation > 0 && currentCar._orientation < 180) {
                if (currentCarY > checkedCarY) {
                    currentDistance = euclideanDistance(currentCarX, currentCarY, checkedCarX, checkedCarY);
                }
            }
            // Only need to check cars with a larger y
            else if (currentCar._orientation > 180) {
                if (currentCarY < checkedCarY) {
                    currentDistance = euclideanDistance(currentCarX, currentCarY, checkedCarX, checkedCarY);
                }
            }

            // Determines the shortest distance in the edge relative to the current car
            if (currentDistance < shortestDistance) {
                shortestDistance = currentDistance;
            }
        }
    }
    return shortestDistance;
}

// This functions allows io from app.js to be used
module.exports = function(io) {
    io.on('connection', function(dcSocket) {
        // Emit initial car positions
        dcSocket.emit('DumbCarArray', carCreation.getFrontendCarArr());

        var carFinished = true; // Used to determine when a car has reached it's destination

        // Loop for moving all dumb cars on an interval
        var dcMovementLoop = setInterval(function() { // Temporarily using interval to display cars moving slowly
            // This loop checks each car in carArray and moves it closer towards its destination
            for (var i = 0; i < carArray.length; i++) {
                var xpos = precisionRound(carArray[i]._xPos,3);
                var ypos = precisionRound(carArray[i]._yPos,3);
                var xdes = precisionRound(carArray[i].xDestination,3);
                var ydes = precisionRound(carArray[i].yDestination,3);
                var speed = precisionRound(carArray[i]._speed,3); // TODO Remove if not being used
                var closestVehicleDistance = collisionAvoidanceCheck(carArray[i].carID); // Finds shortest distance

                carFinished = true; // determines if a car has reached its destination or not

                // TODO Temporily hardcoded values, need to tweak once actual map is working
                // Collision avoidance
                if (closestVehicleDistance < minimumSlowDownDistance(carArray[i]._speed + 0.01)) {
                    // Must decelerate at maximum speed until stopped
                    adjustSpeed(carArray[i]._carID, 0);
                }
                else if (closestVehicleDistance < minimumSlowDownDistance(carArray[i]._speed + 0.02)) {
                    adjustSpeed(carArray[i]._carID, 0.02);
                }
                else if (closestVehicleDistance < minimumSlowDownDistance(carArray[i]._speed + 0.03)) {
                    adjustSpeed(carArray[i]._carID, 0.03);
                }
                else {
                    adjustSpeed(carArray[i]._carID, 0.05); // TODO Need to set max speed to current roads speed limit instead of 0.05
                }

                // checks if the car needs to move along the xaxis
                if (difference(xpos,xdes) > 0.0001) {
                    // Checks if the car needs to move left or right
                    if (xpos > xdes) {
                        carArray[i]._xPos = precisionRound(xpos - carArray[i]._speed, 3);
                    }
                    else if (xpos < xdes) {
                        carArray[i]._xPos = precisionRound(xpos + carArray[i]._speed, 3);
                    }
                    carFinished = false;
                }
                else if (difference(ypos,ydes) > 0.0001) {
                    // If the car is heading north
                    if (ypos > ydes) {
                        // Conditional for when the car is starting north but hasn't yet fully turned
                        if (carArray[i]._orientation != 90) {
                            // TODO Temporarily just sets speed to 0
                            carArray[i]._speed = 0; // Turning speed

                            // Checks if the car needs to turn left heading north
                            if (carArray[i]._orientation >= 0 && carArray[i]._orientation < 90) {
                                carArray[i]._orientation = carArray[i]._orientation + 5;
                            }
                            // Check if car needs to turn right heading north
                            else if (carArray[i]._orientation > 90 && carArray[i]._orientation <= 180) {
                                carArray[i]._orientation = carArray[i]._orientation - 5;
                            }
                        }

                        carArray[i]._yPos = precisionRound(ypos - carArray[i]._speed, 5);
                    }
                    // If the car is heading south
                    else {
                        if (carArray[i]._orientation != 270) {
                            carArray[i]._speed = 0; // Turning speed

                            // Allows for right turns heading south by setting orientation from 0 to 360
                            if (carArray[i]._orientation == 0) {
                                carArray[i]._orientation = 360;
                            }
                            // TODO Will need to change orientation base on next roads orientation
                            // Check if car needs to turn left heading south
                            if (carArray[i]._orientation >= 180 && carArray[i]._orientation < 270) {
                                carArray[i]._orientation = carArray[i]._orientation + 5;
                            }
                            // Check if car needs to turn right heading south
                            else if (carArray[i]._orientation > 270 && carArray[i]._orientation <= 360) {
                                carArray[i]._orientation = carArray[i]._orientation - 5;
                            }
                        }

                        carArray[i]._yPos = precisionRound(ypos + carArray[i]._speed, 3);
                    }
                    carFinished = false;
                }
            }

            // TODO This works but isn't fully connected to the front end
            if (carFinished == true) {
                carArray.splice(i,1);
            }

            // Updates the carArray with new positions and sends data to client
            carCreation.setCarArr(carArray);

            dcSocket.emit('DumbCarArray', carCreation.getFrontendCarArr());
        }, 50); // How often the server updates the client
    });
};
