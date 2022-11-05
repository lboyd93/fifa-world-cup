require(["esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/widgets/Popup"], (Map, MapView, FeatureLayer, Popup) => {
    const map = new Map({
      basemap: "topo-vector"
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      popup: new Popup({
        defaultPopupTemplateEnabled: true
      })
    });

    // World countries layer.
    const countriesLayer = new FeatureLayer({
      url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/FIFA_Test/FeatureServer/1",
      popupTemplate: {
        title: "{COUNTRY}",
        outFields: ['*'],
        content:[
          {
            type: "relationship",
            relationshipId: 0,
            title: "Stadiums in {Country}",
            description: "Largest stadiums played in for the FIFA World Cup from 1930-2018 in {COUNTRY}.",
            displayCount: 2,
            orderByFields: [
              {
                field: "Capacity",
                order: "desc"
              }
            ]
          },
          {
            type: "relationship",
            relationshipId: 2,
            title: "Victories",
            description: "The number of times {COUNTRY} won first place in the FIFA World Cup from 1930-2018.",
            displayCount: 2,
            orderByFields: [
              {
                field: "YEAR",
                order: "desc"
              }
            ]
          },
          {
            type: "relationship",
            relationshipId: 3,
            title: "Second Place",
            description: "The number of times {COUNTRY} got second place in the FIFA World Cup from 1930-2018.",
            displayCount: 2,
            orderByFields: [
              {
                field: "YEAR",
                order: "desc"
              }
            ]
          },
          {
            type: "relationship",
            relationshipId: 1,
            title: "Third Place",
            description: "The number of times {COUNTRY} got third place in the FIFA World Cup from 1930-2018.",
            displayCount: 2,
            orderByFields: [
              {
                field: "YEAR",
                order: "desc"
              }
            ]
          }
        ]
      }
    });

    // Largest stadium locations for every FIFA World Cup.
    const stadiumLayer = new FeatureLayer({
      url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/FIFA_Test/FeatureServer/0",
      popupTemplate: {
        title: "{StadiumName}",
        outFields: ['*'],
        fieldInfos: [
        {
          fieldName: "City",
        },
        {
          fieldName: "Country"
        },
        {
          fieldName: "Year",
          label: "World Cup year used"
        },
        {
          fieldName: "Capacity",
          format: {
            digitSeparator: true
          }
        },
        ],
        content:[
          {
            type: "fields"
          }
        ]
      }
    });

    // Non-spatial table containing FIFA World Cup standings and stats.
    const winnersTable = new FeatureLayer({
      url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/FIFA_Test/FeatureServer/2",
      popupTemplate: {
        title: "FIFA World Cup {Year} Standings in {Host}",
        outFields: ['*'],
        fieldInfos: [
        {
          fieldName: "First",
        },
        {
          fieldName: "Second"
        },
        {
          fieldName: "Third"
        },
        {
          fieldName: "Fourth"
        },
        {
          fieldName: "TopScorer",
          label: "Top scorers and number of goals"
        },
        {
          fieldName: "BestPlayerAward",
          label: "Best player award"
        },
        ],
        content:[
          {
            type: "fields"
          }
        ]
      }
    });
    // Load the non-spatial table and add it to the map's tables.
    winnersTable.load().then(()=>{
      map.tables.add(winnersTable);
    });

    map.layers.addMany([countriesLayer, stadiumLayer]);

    stadiumLayer.when(()=>{
      view.extent = stadiumLayer.fullExtent;
    })
  });