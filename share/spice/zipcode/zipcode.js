window.ddg_spice_zipcode = function(api_result) {
    "use strict";

    // Check errors.
    if(!api_result || !api_result.places || api_result.places.total === 0) {
        return;
    }

    // Get the original query.
    var query;
    $("script").each(function() {
        var matched, result;
        matched = $(this).attr("src");
        if(matched) {
            result = matched.match(/\/js\/spice\/zipcode\/(.+?)\//);
            if(result) {
                query = result[1];
            }
        }
    });
    var script  = $("[src*='js/spice/zipcode']")[0],
     	source  = $(script).attr("src"),
     	matches = source.match(/\/([^\/]+)\/(\w+)$/);

	// expose the zipcode and country from the query
     api_result.zip = matches[1];
     api_result.country = matches[2];

    // Make sure we have a relevant result
    if (!has_relevant_result(api_result, matches)) return;

    // Expose the query. We want a Handlebars helper to use it later.
    window.ddg_spice_zipcode.query = query;

	// Get location
    var name_sections = ["locality1", "admin2", "admin1", "country"],
        header = [],
        headers = [];

     var places = api_result.places.place;

	 // for each result with the same zipcode, construct header string and add to headers array.
	 for (var j = 0; j < places.length ; j++) {
         var condensed_zipcode = places[j].name.replace(/\s+/, '');
    	 if (condensed_zipcode  == api_result.zip)  {
    	 	 for (var i = 0; i < name_sections.length ; i++) {
        	 	 var name = places[j][name_sections[i]];
        	 	 if (name.length && condensed_zipcode  == api_result.zip && header.indexOf(name) === -1)  {  
        	 	 	 header.push(name);
        	 	 }
    	 	 };
    	 	 var header_string = header.join(", ");
    	 	 headers.push(header_string);
		 	 header = [];
    	 }
     };

    // Display the Spice plugin.
    Spice.render({
        data              : api_result,
        header1           : headers[0],
        force_big_header  : true,
        force_no_fold 	  : true,
        source_name       : "MapQuest",
        source_url        : "http://mapq.st/map?q=" + query,
        template_normal   : "zipcode"
    });

    var loadMap = function() {
        // Point to the icons folder.
        L.Icon.Default.imagePath = "/js/leaflet/images";

        // Initialize the map.
        var map = L.map('map');

        // Tell Leaflet where to get the map tiles.
        L.tileLayer('https://flamingtoast.duckduckgo.com/{s}-otile/{z}/{x}/{y}.png', {
            maxZoom: 18, detectRetina: true }).addTo(map);

        // Let's make a rectangle, shall we?
        // This rectangle is used to mark the area occupied by the area code.
        $(".places").each(function(index) {
            var southWest = $(this).data("southwest").split("|");
            var northEast = $(this).data("northeast").split("|");

            southWest = new L.LatLng(southWest[0], southWest[1]);
            northEast = new L.LatLng(northEast[0], northEast[1]);

            var bounds = new L.LatLngBounds(southWest, northEast);
            L.rectangle(bounds,{color: "#ff7800", weight: 1}).addTo(map);

            // Zoom in to the first one.
            if(index === 0) {
                map.fitBounds(bounds);
            }

            // Zoom in to the location when the link is clicked.
            $(this).click(function() {
                (function(bounds) {
                    $("#zero_click_header").empty().append(headers[index]);
                    map.fitBounds(bounds);
                }(bounds));
            });
        });
    };

    // Load LeafletJS.
    $.getScript("/js/leaflet/leaflet.js", loadMap);
};

// from zipcode.js on master
function has_relevant_result(result, matches) {
	var zip     = result.zip,
	    country = result.country,
	    locs    = result.places.place;

	for (var i = 0; i < locs.length; i++) {

	    var current = locs[i];
	    var resName = current.name.replace(/\s+/, "");

	    // check if zipcodes match and either countries match OR no country specified
	    if (resName === zip && ( country === "ZZ" || current["country attrs"].code === country )){
	    	return true;
	    };
	};
	return false;
};
// Filter the zipcodes.
// Only get the ones which are actually equal to the query.
Handlebars.registerHelper("checkZipcode", function(context) {
    "use strict";

    var result = [];
    var place = this.places.place;
    var name = window.ddg_spice_zipcode.query;

    if(place.length === 1) {
        return;
    }

    for(var i = 1; i < place.length; i += 1) {
        if(place[i].name === name) {
            result.push(place[i]);
        }
    }

    return context.fn(result);
});
