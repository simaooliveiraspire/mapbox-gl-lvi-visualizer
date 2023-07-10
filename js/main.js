window.addEventListener("load", function(){
  if(window.location.href.includes('mmsi=') && window.location.href.includes('key=') ){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const mmsi=urlParams.getAll('mmsi')[0];
    const key=urlParams.getAll('key')[0];
    if(mmsi.length==9) initMap(mmsi, key);
    else alert('Invalid mmsi provided.');
  }else{
    alert('Please provide a valid mmsi and key');
  }
});

function initMap(mmsi, key) {

    const map = new mapboxgl.Map({
      container: 'map',
      style:{
          'version': 8,
          'sources': {
              'raster-tiles':
              {
                  'type': 'raster',
                  'tiles': [
                      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  ],
                  'tileSize': 256
              }
          },
          'layers': [
              {
                  'id': 'simple-tiles',
                  'type': 'raster',
                  'source': 'raster-tiles',
                  'minzoom': 0,
                  'maxzoom': 22
              }
          ]
      },
      center: [20,0],
      zoom: 3,
      pitch: 0,
      bearing: 0,
      scrollZoom: true
   });

    map.addControl(new mapboxgl.NavigationControl());

    fetch('https://services.exactearth.com/gws/wfs?authKey='+key+'&service=WFS&request=GetFeature&version=1.1.0&typeName=exactAIS:LVI&outputFormat=json&cql_filter=mmsi='+mmsi)
    .then(function(response) {
      if(response.statusText!=='Unauthorized') return response.json();
      else alert('Invalid key provided');
    })
    .then(function(myJson) {
      if(typeof myJson.features!=='undefined' && myJson.features.length){

        const position=myJson.features[0].geometry.coordinates;
        const heading=myJson.features[0].properties.heading ? myJson.features[0].properties.heading : 0;

        const el = document.createElement('div');
        el.className = 'boatIcon';

        const marker = new mapboxgl.Marker(el)
        .setLngLat(position)
        .setRotation(heading)
        .addTo(map);

        map.setCenter(position);
        map.setZoom(10);

        document.getElementById('map').classList.remove('loading');
      }else{
        alert('No vessel with mmsi '+parseInt(mmsi));
        document.getElementById('map').classList.remove('loading');
      }
  });
}