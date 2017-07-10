import React from 'react';
import { withGoogleMap, GoogleMap, Marker, Polyline } from "react-google-maps";

class Map extends React.Component{
    //there are 3 component int the map: googleMap as Map, Marker as POI, and Polyline to show the routes
    render(){

        //variable labels to label the marker from A until Z
        var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var labelIndex = 0;

        return (
            <GoogleMap
                defaultZoom={13}
                defaultCenter={{ lat: -6.922026734502996, lng: 107.60674953460693 }}
                onClick={this.props.onMapClick}
                onRightClick={() => {}}
                onDragStart={() => {}}
            >

            {this.props.markers.map(marker => (
                <Marker
                    {...marker}
                    onRightClick={() => this.props.onMarkerRightClick(marker)}
                    label={labels[labelIndex++ % labels.length]}
                />
            ))}
            
            <Polyline
                path={this.props.path}
                geodesic= {true}
                strokeColor= {'#0000FF'}
                strokeOpacity= {10.0}
                strokeWeight= {2}
            />
            </GoogleMap>

        );
    }
}
export default withGoogleMap(Map);