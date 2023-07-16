(function() {
	
	// Create a map object and set the view to a given center and zoom level
	var map = L.map('map').setView([0,0], 1);

	var countries = [];
	var randomCountry = "";
	var correct = 0;
	var incorrect = 0;
	
	// Add a tile layer to the map
	// Add the Esri Imagery basemap
	var imageryBasemap = L.esri.basemapLayer("Imagery");
	imageryBasemap.addTo(map);
	
	// Create the "Zoom to World" button
	var zoomToWorldControl = L.control({ position: 'topright' });

	// Define the "Zoom to World" button function
	zoomToWorldControl.onAdd = function(map) {
		var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

		container.innerHTML = '<button onclick="zoomToWorld();" title="Zoom to World"><i class="fas fa-globe"></i></button>';

		return container;
	};

	// Add the "Zoom to World" button to the map
	zoomToWorldControl.addTo(map);

	// Function to reset the map view to the entire world
	window.zoomToWorld = function() {
		map.setView([0, 0], 1);
	};

	// Define an array of colors for nominal coloring
	var colors = [
		'#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
		'#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
		'#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
		'#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
	];

	// Define the url of the geojson file hosted on github
	var url = "https://raw.githubusercontent.com/pratyush-dh/geo-quizapp/main/smp.geojson";

	// Get the title-container element from DOM
	let mapTitle = document.getElementById("title-container");
	let questionBox = document.getElementById("question-container");
	let messageBox = document.getElementById("message-container");
	let correctBox = document.getElementById("correct");
	let incorrectBox = document.getElementById("incorrect");

	// Fetch the geojson file using the fetch API once and store it in a variable
	var geojsonData;
	fetch(url)
		.then(function(response) {
			// Check if the response is ok
			if (response.ok) {
				// Parse the response as json
				return response.json();
			} else {
				// Throw an error if the response is not ok
				throw new Error("Could not fetch the geojson file");
			}
		})
		.then(function(data) {
			// Store the data in the variable
			geojsonData = data;
			geojsonData.features.forEach(feature => {
				countries.push(feature.properties.CNTRY_NAME);	
			});
			console.log("Download completed");
			randomCountry = getRandomCountry();
			drawMap(geojsonData); // Move drawMap function call here
		})
		.catch(function(error) {
			// Log the error to the console
			console.error(error);
		});

	function drawMap(geojsonData) {
	  // Define a function to get a random color from the colors array
	  function getRandomColor() {
		return colors[Math.floor(Math.random() * colors.length)];
	  }

	  // Create an object to store the original style of each layer
	  var originalStyle = {};

	  // Modify the style function to use nominal colors
	  function style(feature) {
		return {
		  fillColor: getRandomColor(),
		  fillOpacity: 1,
		  color: 'black',
		  weight: 1
		};
	  }

	  console.log(geojsonData, "geojsonData");

	  // Add a new map layer using the geojson data and the style function
	  mapLayer = L.geoJSON(geojsonData, {
		onEachFeature: function(feature, layer) {
		  // Store the original style of the layer
		  originalStyle[feature.id] = layer.options.style;

		  layer.on('click', function(e) {
					cntry_name = layer.feature.properties.CNTRY_NAME;
					
					var tooltip = L.tooltip({ permanent: true, direction: 'center', className: 'leaflet-tooltip-own' })
									.setContent(cntry_name)
									.setLatLng(e.latlng)
									.addTo(map);

					setTimeout(function() {
						map.closeTooltip(tooltip);
					}, 1000);
					
					let guess = (cntry_name == randomCountry);
					if (guess) {
						correct = correct + 1;
						correctBox.innerHTML = `<p style="font-size: 1.3rem; font-weight: bold;">Correct: <span style="color: green; font-size: 1.5rem;">${correct}</span></p>`;
					} else {
						incorrect = incorrect + 1;
						incorrectBox.innerHTML = `<p style="font-size: 1.3rem; font-weight: bold;">Incorrect: <span style="color: red; font-size: 1.5rem;">${incorrect}</span></p>`;
					}
					let color = guess ? 'green' : 'red';
					messageBox.innerHTML = `<p style="font-size: 1.3rem; font-weight: bold;">You selected:<br> <span style="color: ${color}; font-size: 1.5rem;">${cntry_name}.</span></p>`;

					setTimeout(function() {
						messageBox.innerHTML = `<p style="font-size: 1.3rem; font-weight: bold;">You selected:<br> <span style="color: ${color}; font-size: 1.5rem;"></span></p>`;;
						questionBox.innerHTML = `<p style="font-size: 1.3em; font-weight: bold;">Please select the following country:<br> <span style="color: orange; font-size: 1.5rem;"></span></p>`;
					}, 500);

					setTimeout(function() {
						randomCountry = getRandomCountry();
					}, 1000);
				});

		  layer.on('mouseover', function(e) {
			this.setStyle({
			  weight: 1,
			  color: '#f1f1f1',
			  dashArray: '',
			  fillOpacity: 1
			});
		  });

		  layer.on('mouseout', function(e) {
			// Reset the style to the original style
			this.setStyle(originalStyle[feature.id]);
			this.setStyle({color:'black'});
		  });
		},
		style: style // Apply the style function to each feature
	  }).addTo(map);
	}


	function getRandomCountry() {
		const aRandom = countries[Math.floor(Math.random() * countries.length)];
		questionBox.innerHTML = `<p style="font-size: 1.3rem; font-weight: bold;">Please select the following country:<br> <span style="color: orange; font-size: 1.5rem;">${aRandom}.</span></p>`;
		return aRandom;
	}
})();
