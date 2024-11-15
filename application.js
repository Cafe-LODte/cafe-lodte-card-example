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
        case "resistancefigthers":
            return "#548235";
        default:
            console.log("no color for "+theme);
            return "#000000"; // Default color, in case of unknown theme
    }
}

var fetchedData;

async function fetchDataTemplate(uri) {
    try {
        //console.log("https://hackalod.coret.org/api/get_card/"+uri);

        const response = await fetch("https://hackalod.coret.org/api/get_card/"+uri);
        
        if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
        }
        fetchedData = await response.json();
        console.log(fetchedData);
        return fetchedData;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function close_card() {
    document.getElementById('cardscene').style.display = "none";
}

function splash() {
    document.getElementById('splash').style.display = "none";
}


// Function to be called when the button is clicked
function showCollection() {
    document.getElementById('mycollection').style.display = "block";
    //console.log('Show collection button clicked!');

    let items="";
    
    // ,"streetname":"Van Limburg Stirumstraat",
    
    //"image":"http://commons.wikimedia.org/wiki/Special:FilePath/Leopold%20van%20Limburg%20Stirum.jpg"
    //"description":"Leopold Count van Limburg Stirum was a politician who was part of the Triumvirate that took p


    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const json = JSON.parse(value);

        console.log(json)

        themeColor = theme_color(json.theme)
        console.log(theme)

//#show_card(cardset.theme,card.identifier);

        items+=`<div class="collitem" style="--i: ${i};" onclick="show_card('${json.theme}','${key}')"><div>`
        items+=`<div class="library-card-streetname" style="background-color:${themeColor}; float: left;"><h2>${json.streetname}</h2></div>`
        items+='<img src="'+json.image+'" alt="'+json.description+'"></img>'
        items+='</div></div>';

    }
    document.getElementById('collectionitems').innerHTML=items;
}

function hideCollection() {
    document.getElementById('mycollection').style.display = "none";
}

function closeadded() {
    document.getElementById('added').style.display = "none";

}

function add_to_collection() {
    //console.log(fetchedData);
    fetchedData.theme=theme;
    const jsonString = JSON.stringify(fetchedData);
    //console.log(uri);
    localStorage.setItem(uri, jsonString);

    document.getElementById('added').innerHTML="<h1>Great, you've collected another card in the "+theme+" category!</h1>";
    document.getElementById('added').style.display = "block";

     document.getElementById('addbutton').innerHTML="<span>&#9989;</span>";
                

}

var theme;
var uri;

function show_card(_theme,_uri) {   
    theme=_theme;
    uri=_uri;
    
    document.documentElement.style.setProperty('--theme-color', theme_color(theme));
    document.documentElement.style.setProperty('--theme-text', getTextColor(theme_color(theme)));

    const cardFront = document.getElementById('card-front-dynamic-content');
    const cardBack = document.getElementById('card-back-dynamic-content');

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
        'imageback': {
            render: value => `<div class="card-imageback"><img src="${value}" alt="Image"></div>`,
            target: 'back'
        },
        'videoback': {
            render: value => `<div class="card-videoimage"><video width="320" height="240" controls><source src="${value}" type="video/ogg"></video></div>`,
            target: 'back'
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
    cardFront.innerHTML ="";
    cardBack.innerHTML ="";

    fetchDataTemplate(uri).then(data => {
        const specifiedOrder = ['streetname', 'person','date', 'identifier'];
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

        //console.log('Data received:', data);
    });

    const card = document.getElementById('card');
    let isFlipped = false;

    card.classList.add(`theme-${theme}`)

    card.addEventListener('click', (e) => {
        //console.log(e);

        function checkElement(element, substr) {
            return Array.from(element.classList).some(className => className.includes(substr));
        }

        if (checkElement(e.target,'icon')||checkElement(e.target.parentElement,'icon')) { return; }
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

    document.getElementById('addbutton').innerHTML="<span>&#128933;</span>";

    document.getElementById('cardscene').style.display = "block";

    themeElement = document.getElementById('theme');
    themeElement.innerHTML = `<img title='${theme}' src='icons/${theme}.png'></img>`
}

var map;

function init() {

    document.getElementById("closebutton").addEventListener("click", function() {
        close_card();	
    });

    document.getElementById("addbutton").addEventListener("click", function() {
        add_to_collection();	
    });

    document.getElementById("splash").addEventListener("click", function() {
        splash();	
    });

    document.getElementById("mycollection").addEventListener("click", function(e) {
        //console.log(e);
        if (e.target.localName=='button') { return; }
        showCollection();
    });

    document.getElementById("closemybutton").addEventListener("click", function() {
        hideCollection();
    });

    map = L.map('histmap').setView([52.36989183301604, 4.870368704430573], 13);

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

    const showCollectionControl = L.control({ position: 'bottomright' });

    showCollectionControl.onAdd = function(map) {
    // Create a button element
    const button = L.DomUtil.create('button', 'my-custom-button');
    button.innerHTML = "Show My Collection";
    button.style.padding = "10px";
    button.style.backgroundColor = "#fff";
    button.style.color = "#444";
    button.style.border = "#444";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    
    // Prevent map interactions when clicking the button
    L.DomEvent.disableClickPropagation(button);
    
    // Add click event to the button to call the showCollection function
    button.onclick = function() {
        showCollection();
    };

    return button;
    };

    // Add the button to the map
    showCollectionControl.addTo(map);

    // TODO current location
/*
    const imageUrl1 = 'https://hackalod.coret.org/icons/athletes.png';
    const imageBounds1 = [[52.3948, 4.9025], [52.3978, 4.9055]]; 
    L.imageOverlay(imageUrl1, imageBounds1).addTo(map);

    const imageUrl5 = 'https://hackalod.coret.org/icons/writers.png';
    const imageBounds5 = [[52.3669, 4.8772], [52.3699, 4.8772]]; 
    L.imageOverlay(imageUrl5, imageBounds5).addTo(map);

   const imageUrl2 = 'https://hackalod.coret.org/icons/artists.png';
    const imageBounds2 = [[52.39477, 4.90254], [52.39687, 4.908555]]; 
    L.imageOverlay(imageUrl2, imageBounds2).addTo(map);


    const imageUrl3 = 'https://hackalod.coret.org/icons/composers.png';
    const imageBounds3 = [[52.39477, 4.90254], [52.39687, 4.908555]]; 
    L.imageOverlay(imageUrl3, imageBounds3).addTo(map);

    const imageUrl4 = 'https://hackalod.coret.org/icons/women.png';
    const imageBounds4 = [[52.3536, 4.8451], [52.3566, 4.8481]]; 
    L.imageOverlay(imageUrl4, imageBounds4).addTo(map);

    const imageUrl6 = 'https://hackalod.coret.org/icons/politicians.png';
    const imageBounds6 = [[52.3846, 4.8817], [52.3886, 4.8857]]; 
    L.imageOverlay(imageUrl6, imageBounds6).addTo(map);


    const imageUrl7 = 'https://hackalod.coret.org/icons/mathematicians.png';
    const imageBounds7 = [[52.3582, 4.9200], [52.3602, 4.9230]]; 
    L.imageOverlay(imageUrl7, imageBounds7).addTo(map);
*/
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
              let geoJsonLayer = L.geoJSON(feature, { style: { color: color, weight: 8 }}).addTo(map);
              geoJsonLayer.on('click', function() {
                show_card(cardset.theme,card.identifier);
              });
          } catch (e) {
              console.log(e,card);
          }
      
      
      });
    });
  }

  function getTextColor(backgroundColor) {
    // Check if the background color is in hex format (e.g., "#RRGGBB" or "#RGB")
    if (backgroundColor.startsWith("#")) {
      let hex = backgroundColor.slice(1);
  
      // Expand shorthand form (e.g., "#03F") to full form ("0033FF")
      if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("");
      }
  
      // Convert hex to RGB values
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
  
      // Calculate brightness
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
  
      // Return white or black based on brightness threshold
      return brightness > 146 ? "#000000" : "#FFFFFF";  // Black or White
    } else {
      console.error("Please provide a valid hex color (e.g., #FFFFFF).");
      return null;
    }
  }
  