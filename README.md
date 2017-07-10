# showRoutesFrontEnd
App based ReactJs using google map API to show map, put markers, and calculate routes for more than one marker. <br />
Using "react-google-maps" package to build map, marker, and polyline to show the routes.<br />
On the index page, front end app will call backend to get position of all markers data as json.<br />
The new marker that put on the map will be converted into json data and sent to backend app to store it into DB to make the marker persistance for all user.<br />
The maximum number of markers is 23 markers as google api made that restriction.<br />
Routes only can be shown when there are 2 or more markers on the map.