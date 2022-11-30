# FIFA World Cup Relationship Explorer
This application uses the ArcGIS API for JavaScript to display FIFA World Cup data from 1930-2018. [RelationshipContent](https://developers.arcgis.com/javascript/latest/api-reference/esri-popup-content-RelationshipContent.html)(version 4.25) is added to the [PopupTemplate](https://developers.arcgis.com/javascript/latest/api-reference/esri-PopupTemplate.html) to display the related records within the pop-up.

The following table shows the relationships that are configured on the layers and tables that are displayed in the application:
![relationships](resources/relationships.png)

RelationshipContent provides a way to browse related records of the current selected feature within its popup, as shown in the images below. The Origin Feature image shows a popup template configured with RelationshipContent. When selecting one of the related features in the list, the popup template for the chosen related destination feature displays. The Related Destination Feature image shows the destination popup template content with FieldsContent and RelationshipContent configured. 

When exploring a related feature's RelationshipContent, one could navigate into that feature's related records or exit the origin feature's related record exploration with the arrow button.

| Origin Feature | Related Destination Feature |
| -------------- | ------------- |
| ![origin feature](resources/brazil-popup-multi.png) | ![destination feature](resources/related-feature.png) |

There are two custom actions added to the pop-up:
- `Zoom to Stadium` calls `goTo` on the view to zoom to the selected stadium. This only works when a stadium is in the popup. Note this does not work when viewing a stadium as a related record.
- `Full Extent` resets the extent to the stadium layer's extent.

Blog post: https://www.esri.com/arcgis-blog/products/js-api-arcgis/developers/browsing-related-records-with-the-arcgis-api-for-javascript

Link to live sample: https://lboyd93.github.io/fifa-world-cup/
