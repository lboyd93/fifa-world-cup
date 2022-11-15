require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/core/reactiveUtils",
  "esri/widgets/Legend"
], (Map, MapView, FeatureLayer, reactiveUtils, Legend) => {
  const map = new Map({
    basemap: "satellite",
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    popup: {
      dockEnabled: true,
      dockOptions: {
        breakpoint: false,
        position: "top-right"
      }
    },
  });

  // World countries layer.
  const countriesLayer = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/FIFA_World_Cup/FeatureServer/1",
    title: "World Countries Generalized",
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: null,
        outline: {
          color: "#FEC310",
          width: 0.5
        }
      },
    },
    popupTemplate: {
      title: "{COUNTRY}",
      outFields: ["*"],
      content: [
        {
          type: "relationship",
          relationshipId: 0,
          title: "Stadiums in {Country}",
          description:
            "Largest stadiums played in for the FIFA World Cup from 1930-2018 in {COUNTRY}.",
          displayCount: 2,
          orderByFields: [
            {
              field: "Capacity",
              order: "desc",
            },
          ],
        },
        {
          type: "relationship",
          relationshipId: 2,
          title: "Victories",
          description:
            "The number of times {COUNTRY} won first place in the FIFA World Cup from 1930-2018.",
          displayCount: 2,
          orderByFields: [
            {
              field: "YEAR",
              order: "desc",
            },
          ],
        },
        {
          type: "relationship",
          relationshipId: 3,
          title: "Second Place",
          description:
            "The number of times {COUNTRY} got second place in the FIFA World Cup from 1930-2018.",
          displayCount: 2,
          orderByFields: [
            {
              field: "YEAR",
              order: "desc",
            },
          ],
        },
        {
          type: "relationship",
          relationshipId: 1,
          title: "Third Place",
          description:
            "The number of times {COUNTRY} got third place in the FIFA World Cup from 1930-2018.",
          displayCount: 2,
          orderByFields: [
            {
              field: "YEAR",
              order: "desc",
            },
          ],
        },
      ],
    },
  });

  // Largest stadium locations for every FIFA World Cup.
  const stadiumLayer = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/FIFA_World_Cup/FeatureServer/0",
    title: "FIFA World Cup Largest Stadiums",
    popupTemplate: {
      title: "{StadiumName} ({Year})",
      outFields: ["*"],
      fieldInfos: [
        {
          fieldName: "City",
        },
        {
          fieldName: "Country",
        },
        {
          fieldName: "Year",
          label: "World Cup year used",
        },
        {
          fieldName: "Capacity",
          format: {
            digitSeparator: true,
          },
        },
      ],
      content: [
        {
          type: "fields",
        },
      ],
    },
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "https://lboyd93.github.io/fifa-world-cup/resources/soccerball.svg",
        width: "32px",
        height: "32px"
      },
    },
  });

  // Non-spatial table containing FIFA World Cup standings and stats.
  const winnersTable = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/FIFA_World_Cup/FeatureServer/2",
    title: "Country Statistics",
    popupTemplate: {
      title: "FIFA World Cup {Year} Standings in {Host}",
      outFields: ["*"],
      fieldInfos: [
        {
          fieldName: "First",
        },
        {
          fieldName: "Second",
        },
        {
          fieldName: "Third",
        },
        {
          fieldName: "Fourth",
        },
        {
          fieldName: "TopScorer",
          label: "Top scorers and number of goals",
        },
        {
          fieldName: "BestPlayerAward",
          label: "Best player award",
        },
      ],
      content: [
        {
          type: "fields",
        },
      ],
    },
  });
  // Load the non-spatial table and add it to the map's tables.
  winnersTable.load().then(() => {
    map.tables.add(winnersTable);
  });

  map.layers.addMany([countriesLayer, stadiumLayer]);

  view.when(() => {
    view.extent = stadiumLayer.fullExtent;
    view.whenLayerView(countriesLayer).then((countriesLayerView) => {
      // Use reactiveUtils to watch when the layerview is done updating once.
      reactiveUtils
        .whenOnce(() => !countriesLayerView?.updating)
        .then(() => {
          // Create a query from the layerview.
          let query = countriesLayerView.createQuery();
          query.objectIds = [32]
          query.outFields = countriesLayerView.availableFields;
          // Query for the Sonoma-Lake-Napa Unit and open it's popup.
          countriesLayerView.queryFeatures(query).then((results) => {
            view.popup.open({
              features: results.features[0],
              location: results.features[0].geometry.centroid,
              fetchFeatures: true
            });
          });
        });
    });
  });

  view.ui.add(new Legend({view:view}), "bottom-left");
});
