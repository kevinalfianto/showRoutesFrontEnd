import React from 'react';
import {render} from 'react-dom';

import RoutesButton from './RoutesButton.jsx';
import Map from './Map.jsx';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';

class App extends React.Component {

    constructor(props) {
        super(props);

        //state to contain all markers
        this.state = {
            markers: [{
                position: {
                lat: 0,
                lng: 0,
                },
            },]
        };

        //state to contain all path for routes
        this.state = {
            path: [
                {},
                {},
                {},
                {},
            ]
        };

        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleMapClick = this.handleMapClick.bind(this);
        this.handleMarkerRightClick = this.handleMarkerRightClick.bind(this);
    }

    componentDidMount() {
        //fetch initial marker data from database
        fetch('https://warm-citadel-55978.herokuapp.com')
            .then(res => res.json())
            .then(pos => this.setState({ markers:pos }));
            
    }

    handleMapClick(event) {
        //function to add new marker by left click the map
        //totalMarker contain the number of marker now
        //nextMarkers will filter the marker that has same latlong with event click position 
        const totalMarker = this.state.markers.length;
        var nextMarkers = this.state.markers.filter(marker => 
        	marker.position.lat.toPrecision(10) !== event.latLng.lat().toPrecision(10) && 
        	marker.position.lng.toPrecision(10) !== event.latLng.lng().toPrecision(10));

        //add new marker from event, if a marker filtered before,
        //the number of the marker will be same as before 
        nextMarkers = [
            ...nextMarkers,
            {
                position: {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng(),
                },
            },
        ];

        //if total number marker is the same as before, it means user click on same spot and will not be updated
        //and number of marker must be 23 or bellow so google api can calculate route
        if (totalMarker !== nextMarkers.length && nextMarkers.length<24) {
            //make url to send data to express server to create new marker data
            var url = 'https://warm-citadel-55978.herokuapp.com/create?' + 'latitude=' + event.latLng.lat().toPrecision(10) +
                        '&longitude=' +  event.latLng.lng().toPrecision(10);

            fetch(url, {
                method: "post",
                mode: 'cors',
            })

            //reset the routes
            this.setState({
                path: [],
            });

            //change the state of markers now with the new one
            this.setState({
                markers: nextMarkers,
                defaultAnimation: 2,
            });
        }

        //googlemap api restrict the maximum of the point is 23 to calculate routes
        if (nextMarkers.length > 23) {
            toast.warn("Maximum number of marker is 23 (W Label)");
        }
    }

    handleMarkerRightClick(event) {
        //function to delete a marker by right click the particular marker
        //nextMarkers will filter the marker that has same latlong with event click position 
        //so the marker in event click position will be erased from temporary array of marker
        const totalMarker = this.state.markers.length;
        const nextMarkers = this.state.markers.filter(marker => 
        	marker.position.lat.toPrecision(10) !== event.position.lat.toPrecision(10) && 
            marker.position.lng.toPrecision(10) !== event.position.lng.toPrecision(10));

        //if total number marker is the same as before, it means user click on spot without marker and will not be updated
        if (totalMarker !== nextMarkers.length) {
            //make url to send data to express server to delete a marker data
            var url = 'https://warm-citadel-55978.herokuapp.com/delete?' + 'latitude=' + event.position.lat.toPrecision(10) +
                      '&longitude=' +  event.position.lng.toPrecision(10);

            fetch(url, {
                method: "post",
                mode: 'cors',
            })

            //reset the routes
            this.setState({
                path: [],
            });

            //change the state of markers now with the new one
            this.setState({
                markers: nextMarkers,
            });
        }
    }

    handleButtonClick() {
        //this function to show routes between POI
        //assume the first marker in the array as origin and the last marker of the array as destination to use google api
        const directionsService = new google.maps.DirectionsService();
        const nMarker = this.state.markers.length;
          
        //routes can be made if there are more than one marker
        if (nMarker > 1) {
            //fill the origin & destination
            var start = new google.maps.LatLng(this.state.markers[0].position.lat, this.state.markers[0].position.lng);
            var end = new google.maps.LatLng(this.state.markers[nMarker-1].position.lat, this.state.markers[nMarker-1].position.lng);

            //create the request for only has origin and destination data
            var request = {
                origin: start,
                destination: end,
                travelMode: 'DRIVING'
            };
            var results = {};
            var tempPath = [];

            //3 or more markers means there are waypoint between origin and the destination
            if (nMarker >= 3) {
                //fill waypoint with position between origin and end
                var waypts = [];
                for (let i=1; i < this.state.markers.length-1; i++) {
                    var point  = new google.maps.LatLng(this.state.markers[i].position.lat, this.state.markers[i].position.lng);
                    waypts.push({location: point,stopover: true});
                }

                //create the request that has origin, destination, and waypoint
                //use parameter optimize true to get the routes for travel all POI eficiently
                request = {
                    origin: start,
                    destination: end,
                    waypoints: waypts,
                    optimizeWaypoints: true,
                    travelMode: 'DRIVING'
                };
            }

            directionsService.route(request, (result, status) => {
                if (status == 'OK') {
                    results = result.routes[0].legs;

                    //fill the departure location first
                    tempPath = [
                        {
                            lat: results[0].steps[0].start_location.lat(),
                            lng: results[0].steps[0].start_location.lng(),
                        },
                    ];
                    //fill the path with the steps end location from google response json
                    for (let i=0; i<results.length; i++) {
                        for (let j=0; j<results[i].steps.length; j++) {
                            tempPath = [
                                ...tempPath,
                                {
                                    lat: results[i].steps[j].end_location.lat(),
                                    lng: results[i].steps[j].end_location.lng(),
                                },
                            ];
                        }
                    }
                    this.setState({
                        path: tempPath,
                    });
                }
            })
        } else {
            //reset the routes if the number of marker is bellow than 2
            this.setState({
                path: [],
            });
        }
    }




    render () {

      //the component of the page there are Sidebar contain button to show the routes
      //toast container to warn user if the marker already 23 markers
      //Map component to contain googlemap, marker, and polyline
        return (
            <div>
                <ToastContainer />
                <RoutesButton 
                    label="Show Routes"
                    onClick={this.handleButtonClick}
                />
                <div>Left click on map to create a new POI, right click on a marker to delete a POI.</div>
                <div>Origin place always from marker labeled "A" and destination is a marker with last alphabet label.</div>
                <Map
                    containerElement={
                       <div style={{ height: `100%` }} />
                    }
                    mapElement={
                       <div style={{ height: `100%` }} />
                    }
                    markers={this.state.markers}
                    path = {this.state.path}
                    onMapClick={this.handleMapClick}
                    onMarkerRightClick={this.handleMarkerRightClick}
                />
            </div>    
        )
    }
}

render(<App/>, document.getElementById('app'));