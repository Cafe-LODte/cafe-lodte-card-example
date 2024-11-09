

function theme_color(theme) {
    switch (theme) {
        case "artists":
        return "#ff3300";
        case "writers":
            return "#d60093";
        case "composers":
        return "#ffcc00";
        case "politicians":
        return "#33ccff";
        case "athletes":
        return "#cc66ff";
        case "women":
        return "#00ff00";
        case "mathematicians":
        return "#2e75b6";	  
        default:
        console.log("no color for "+theme);
        return "#000000"; // Default color, in case of unknown theme
    }
}

async function fetchDataTemplate(uri) {
    try {
        const response = await fetch("https://hackalod.coret.org/api/get_card/"+uri);
        if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
        }
        const fetchedData = await response.json();
        console.log(fetchedData);
        return fetchedData;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function show_card(theme,uri) {
    //theme = "artists"
    //uri = 'https://pathfindr-creator.coret.org/api/get_card/Q19328795'
    
    
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');

    const customRenderers = {
        'person': {
            render: value => `<div class="card-person"><a href="${value}">Person (wikidata)</a></div>`,
            target: 'front'
        },            
        'identifier': {
            render: value => `<div class="card-identifier"><a href="${value}">Street (wikidata)</a></div>`,
            target: 'front'
        },            
        'streetname': {
            render: value => `<div class="card-streetname"><h2>${value}</h2></div>`,
            target: 'front'
        },
        'description': {
            render: value => `<div class="card-description"><p>${value}</p></div>`,
            target: 'front'
        },
        'image': {
            render: value => `<div class="card-image"><img src="${value}" alt="Image"></div>`,
            target: 'front'
        },
        'date': {
            render: value => `<div class="card-date">
                <time class="card-date-start" datetime="${value.startdate}">${new Date(value.startdate).getFullYear()}</time>-<time class="card-date-end" datetime="${value.enddate}">${new Date(value.enddate).getFullYear()}</time>
                </div>`,
            target: 'front'
        },
        'multiline': {
            render: value => ``,
            target: 'front'
        },
        'point': {
            render: value => ``,
            target: 'front'
        }

    };

    order = ['streetname', ]

    fetchDataTemplate(uri).then(data => {
        const specifiedOrder = ['streetname', 'person', 'identifier'];
        const allKeys = Object.keys(data);
        const existingSpecifiedOrder = specifiedOrder.filter(key => allKeys.includes(key));
        const unspecifiedKeys = allKeys.filter(key => !existingSpecifiedOrder.includes(key));
        const orderedKeys = [...existingSpecifiedOrder, ...unspecifiedKeys];

        for (const key of orderedKeys) {
            if (data.hasOwnProperty(key)) {
                let htmlContent;
                let targetElement = cardFront;

                if (customRenderers[key]) {
                    htmlContent = customRenderers[key].render(data[key]);
                    targetElement = customRenderers[key].target === 'back' ? cardBack : cardFront;
                } else {
                    htmlContent = `<div class="card-${key}"><span>${data[key]}</span></div>`;
                }

                targetElement.innerHTML += htmlContent;
            }
        }

        console.log('Data received:', data);
    });

    const card = document.getElementById('card');
    let isFlipped = false;


    card.classList.add(`theme-${theme}`)

    card.addEventListener('click', () => {
        if (isFlipped) {
            card.classList.remove('card--flipped');
            card.classList.add('card--unflipped');
        } else {
            card.classList.remove('card--unflipped');
            card.classList.add('card--flipped');
        }

        const cardFaces = document.querySelectorAll('.card-face');
        cardFaces.forEach(face => {
            face.classList.remove('shine');
            void face.offsetWidth; // Trigger reflow to restart animation
            face.classList.add('shine');
        });

        isFlipped = !isFlipped;
    });

    document.getElementById('cardcontent').style.display = "block";
    
      themeElement = document.getElementById('theme');
       themeElement.innerHTML = `<img src='icons/${theme}.png'></img>`
}

var map;

function init() {

    map = L.map('histmap').setView([52.375769772784565, 4.8926717051338535], 13);

 
    var openStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}.pbf', {
      attribution: 'Map of Today'
    });
    
    
    // Define the two tile layers
    var historicalMap1876 = L.tileLayer('https://images.huygens.knaw.nl/webmapper/maps/loman/{z}/{x}/{y}.jpeg', {
      attribution: 'Historical Map Loman'
    });
    var historicalMap1985 = L.tileLayer('https://images.huygens.knaw.nl/webmapper/maps/pw-1985/{z}/{x}/{y}.png', {
      attribution: 'Historical Map 1985'
    });
    
    // Add one of the layers to the map initially
    openStreetMap.addTo(map);
    
    // Create an object with the base layers to switch between
    var baseLayers = {
    //  "Historical Map 1876": historicalMap1876,
      "Historical Map 1985": historicalMap1985,
      "OpenStreetMap": openStreetMap
    };
    
    // Add the layers control to the map
    L.control.layers(baseLayers).addTo(map);
    
    
    
    // Add one of the layers to the map initially
    openStreetMap.addTo(map);
    
    fetchData();
}

function fetchData() {
    const url = "https://pathfindr-creator.coret.org/api/get_game/amsterdam";
  
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
  
    xhr.onload = function() {
      if (xhr.status === 200) {
        const jsonData = JSON.parse(xhr.responseText);
        processData(jsonData);
      } else {
        console.error("Request failed.  Returned status of " + xhr.status);
      }
    };
  
    xhr.onerror = function() {
      console.error("Request failed.");
    };
  
    xhr.send();
  }


function processData(data) {
    let color; // Declare variable outside loop
  
    data.cardsets.forEach((cardset) => {
        
      color = theme_color(cardset.theme);
      cardset.cards.forEach((card) => {	  
        wkt = new Wkt.Wkt();
          try {
              wkt.read(card.aswkt);
              feature={ "type": "Feature", "geometry": wkt.toJson() };
              let geoJsonLayer = L.geoJSON(feature, { style: { color: color, weight: 5 }}).addTo(map);
              geoJsonLayer.on('click', function() {
                show_card(cardset.theme,card.identifier);
              });
          } catch (e) {
              console.log(e);
          }
      
      
      });
    });
      //map.fitBounds(L.geoJSON(feature).getBounds(),{maxZoom:19});
  
  }
  