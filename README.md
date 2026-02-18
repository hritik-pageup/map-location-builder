# Map Location Builder

A lightweight, standalone interactive map widget for managing projects and locations across India. Built with Leaflet.js and a simple Python backend for local persistence.

## Features

-   **Interactive Map**: Zoomable map of India with state boundaries.
-   **Location Management**: Add, edit, and delete locations and associated projects.
-   **Admin Mode**: Secure(ish) admin interface to manage data.
-   **Portable Widget**: Single JS file (`map-widget.js`) to embed the map in any HTML project.
-   **Local Persistence**: Saves data to a local `locations.json` file.
-   **Zero Dependencies**: No Node.js or database required. Just Python.

## Quick Start

1.  **Start the Server**:
    The map requires a backend to save data and serve files.
    ```bash
    python server.py
    ```
    This will start the server on `http://localhost:8000`.

2.  **Open the Map**:
    Visit [http://localhost:8000/index.html](http://localhost:8000/index.html)

## Admin Mode (Editing)

To enable editing features (add/remove locations), append `?edit-map` to the URL:

[http://localhost:8000/index.html?edit-map](http://localhost:8000/index.html?edit-map)

1.  Click the **Lock Icon** at the bottom right.
2.  Enter Password: `admin`
3.  Use the **Map Marker** button to add new locations by clicking on the map.
4.  Click existing markers to manage projects or update status.

## Embed in Your Project

You can use the map in any other project by including `map-widget.js`.

1.  **Copy Files**: Ensure `map-widget.js` is accessible.
2.  **Start Server**: Ensure `server.py` is running to handle data.
3.  **Add Container & Script**:

```html
<!-- Container -->
<div id="my-map" style="height: 600px; width: 100%;"></div>

<!-- Widget Script -->
<script src="path/to/map-widget.js"></script>

<!-- Initialize -->
<script>
    initProjectMap('my-map', {
        serverUrl: 'http://localhost:8000' // URL where server.py is running
    });
</script>
```

## Files Structure

-   `map-widget.js`: The core logic and UI. Automagically injects CSS and Leaflet.
-   `server.py`: Simple HTTP server to handle JSON saving.
-   `locations.json`: Stores all location data.
-   `index.html`: Demo page.
-   `india-composite.geojson` & `indian_states.json`: Map geometry files.

## Credits

-   Map Data: [DataMeet](https://github.com/datameet/maps) & [Subhash9325](https://github.com/Subhash9325/GeoJson-Data-of-Indian-States)
