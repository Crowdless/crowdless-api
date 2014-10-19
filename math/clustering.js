// Dynamic time / space clustering
// Exports a clusterer object which can then be provided with a dataset of n size. Iteration takes O(n * z) for initial clustering iteration where n is the length input locations and z is length of the input social data .
var HashMap = require('hashmap').HashMap
var moment = require('moment')
var brain = require('brain')
var geolib = require('geolib')


// Constructor object for new clusterer
exports.clusterer = function(socialDataSet, locationDataSet) {
    console.log('Clustering algorithm has begun with ' + socialDataSet.length + ' social data objects and ' + locationDataSet.length + ' location data objects.')
    var startTime = Date.now();

    // Assign the Data Map to the object
    var locationClusterPool = this.dataMap = new HashMap()
    var locationMachineAlgorithmMap = this.machineAlgorithmMap = new HashMap()

    // Allocate a new HashMap entry to each location
    for ( var i1 = 0; i1 < locationDataSet.length; i1++ ){
        locationClusterPool.set(locationDataSet[i1], generateSegmentedArray(24))
    }


    // Filter through each social data point and assign it to proximal locations
    for ( var i = 0; i < socialDataSet.length; i++ ) {
        var socialDatum = socialDataSet[i]

        for ( var j = 0; j < locationDataSet.length; j++ ) {
            var locationDatum = locationDataSet[j]

            var pointDistance = geolib.getDistance(
                { latitude: locationDatum.lat, longitude: locationDatum.long },
                { latitude: socialDatum.lat, longitude: socialDatum.long }
            )

            // This is a very wide tolerance and should be closed up in the future when more data has been collected
            if (pointDistance < process.env.DISTANCE_TOLERANCE ) {
                // Assign the in range data point to the location
                var dateTime = moment(socialDatum.dateTime)
                var hour = dateTime.hour()
                locationClusterPool.get(locationDatum)[hour].push(socialDatum)
            }

        }

    }

    // Time to educate the neural networks.
    // FIRE TEH MIND CANNON
    for ( var i2 = 0; i2 < locationDataSet.length; i2++ ) {
        var location = locationDataSet[i2]
        var locationHoursArray = locationClusterPool.get(location)

        // Spawn a neural network
        var locationNeuralNet = new brain.NeuralNetwork()

        for ( var hour = 0; hour < locationHoursArray.length ; hour++ ) {
            var hourArray = locationHoursArray[hour]
            console.log(hourArray.length)
            // Intentional fudge clause to eradicate empty datasets. In the future this would be removed to account for exceptionally quiet periods.
            locationNeuralNet.train(hour, hourArray.length)
        }

        locationMachineAlgorithmMap.set(location, locationNeuralNet)
    }

    // At this point each location should have a trained neural network that can be used to predict footfall for a given hour in the day.
    // Now iterate through each location to generate its population at each hour
    for ( var i2 = 0; i2 < locationDataSet.length; i2++ ) {
        var location = locationDataSet[i2]
        var predictedHoursArray = []

        // Retrieve the neural network
        var locationNeuralNet = locationMachineAlgorithmMap.get(location)

        // Generate hourly predictions for every hour
        for ( var hour = 0; hour < 24 ; hour++ ) {
            predictedHoursArray[hour] = locationNeuralNet.run(hour)
        }

        console.log(predictedHoursArray)
    }

}


var generateSegmentedArray = function(segments) {
    var baseArray = []
    var segmentedArray = baseArray

    for( var i = 0; i < segments; i++ ) {
        segmentedArray.push(segmentedArray)
    }

    return segmentedArray
}