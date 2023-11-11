const searchForm = document.querySelector('.search-form')
const userInput = document.querySelector('#user-input')
const needsModal = document.querySelector('.needs-modal-container')
const foodbankList = document.querySelector('.foodbank-list')
const titleContainer = document.querySelector('.title')

// check users postcode input
const postcodeValidation = async (e) => {
    e.preventDefault()
    showSpinner()
    try {
        const res = await fetch(`https://api.postcodes.io/postcodes/${userInput.value}/validate`)
        const data = await res.json()
        if (!res.ok || !data.result) {
            // shows error if postcode is invalid
            showPostcodeError()
        } else {
            await getFoodbanks()
        }
    } catch (error) {
        console.log(error)
    }
}

// get foodbanks near the users location
const getFoodbanks = async () => {
    try {
        const res = await fetch(`https://www.givefood.org.uk/api/2/foodbanks/search/?address=${userInput.value}`)
        if (!res.ok) {
            showError()
        } else {
            const data = await res.json()
            displayFoodbanks(data)
        }
    } catch (error) {
        console.log(error)
    } finally {
        // reset the user input
        searchForm.reset()
        // hide loading spinner
        hideSpinner()
    }
}

// display the foodbanks in cards
const displayFoodbanks = (foodbanks) => {
    // show the foodbank list container
    foodbankList.style.display = 'block'
    let toolTipData = []
    foodbankList.innerHTML = ''
    // add a title, count and buttons to the content  container
    titleContainer.innerHTML = `
<h4>Foodbanks Near You</h4>
<p>${foodbanks.length} Results found in ${userInput.value.toUpperCase()}</p>
<div class="view-buttons">
<button class="button list-btn">List View</button>
<button class ="button inactive map-btn">Map View</button>
</div>
`
    // create a card for every foodbank from the search results
    foodbanks.forEach(({ name, address, phone, email, distance_mi, urls, needs, lat_lng }) => {
        // create content to be used for card and map pop up
        const foodbankContent = `
            <h4>${name}</h4>
            <h5>Contact Details:</h5>
            <p><span class="material-icons md-18">
            home
            </span> Address: ${address}</p>
            <p><span class="material-icons md-18">
            location_on
            </span> Distance: ${distance_mi} miles</p>
            <p><span class="material-icons md-18">
            phone
            </span> Phone: ${phone} </p>
            <p><span class="material-icons md-18">
            email
            </span> Email: ${email} </p>
    `
        // create content for the card only
        const foodbankCard = `
    <div class="foodbank-card grid">
    <div class="foodbank-card-text">
      ${foodbankContent}
      </div>
        <div class="foodbank-card-image">
        <img src="${urls.map}" alt="${name} google maps">
        <div class="button-row">
        <a class="website-button" href="${urls.homepage}" target="_blank">Visit Website</a>
        <a class="donate-button" target="_blank" id="${needs.id}">Donate</a>
        </div>
        </div>
    </div>
`
        // add cards to the container
        foodbankList.innerHTML += foodbankCard
        // show the title container
        titleContainer.style.display = 'block'
        // add location and html content to array
        toolTipData.push({ lat_lng, content: foodbankContent })
    })
    // scroll to the first card
    scrollToCard(titleContainer)
    // save tooltipdata to local storage
    saveData(toolTipData)
}
// get needs of individual foodbank
const getNeeds = async (e) => {
    showSpinner()
    try {
        const res = await fetch(`https://www.givefood.org.uk/api/2/need/${e.target.id}/`)
        if (!res.ok) {
            console.log('Error fetching data')
        } else {
            const data = await res.json()
            showNeedsModal(data)
        }
    } catch (error) {
        console.log(error)
    } finally {
        hideSpinner()
    }
}
// show modal with list of foodbank needs
const showNeedsModal = (data) => {
    if (data.needs.toLowerCase() == 'unknown') {
        showDefaultModalList()
    } else {
        document.querySelector('.needs-modal-content').innerHTML = `
        <h6>This food bank is asking for donations of:</h6>
        <ol class="needs-list"></ol>`
        let needsArr = data.needs.split('\n')
        for (let item of needsArr) {
            document.querySelector('.needs-list').innerHTML += `
            <li>${item}</li>`
        }
        needsModal.style.transform = 'scale(1)'
    }
}
// show default list when no data is ava
const showDefaultModalList = () => {
    document.querySelector('.needs-modal-content').innerHTML = `
    <h6>No current data available</h6>
    <p>However, you can still donate some commonly needed items:</p>
    <ol class="needs-list">
    <li>UHT Milk</li>
    <li>Tinned meat (Hotdogs, Meatballs etc.)</li>
    <li>Tinned Fish</li>
    <li>Tinned Fruit</li>
    <li>Coffee/Tea</li>
    <li>Long Life Juice</li>
    <li>Jam and spreads</li>
    <li>Sponge/Rice Pudding</li>
    <li>Pasta/Rice</li>
    <li>Tinned Soup</li>
    <li>Tinned Meals (Spaghetti, Chicken or Vegetable Curries, Chilli)</li>
    <li>Shower Gel</li>
    <li>Toilet Rolls </li>
    </ol>`
    needsModal.style.transform = 'scale(1)'
}


// show or hide loading spinner when data is fetched
const showSpinner = () => {
    document.querySelector('.loading-spinner-overlay').style.display = 'flex'
}
const hideSpinner = () => {
    document.querySelector('.loading-spinner-overlay').style.display = 'none'
}
// show error to the user if an error occurs
const showError = () => {
    hideSpinner()
    document.querySelector('.search').innerHTML += `<p>Error fetching data, please try again after some time.</p>`
}
// show error if postcode is invalid
const showPostcodeError = () => {
    hideSpinner()
    document.querySelector('.search').innerHTML += `<p class="error">Error fetching data, please check your postcode and try again</p>`
}

const scrollToCard = (foodbankList) => {
    foodbankList.scrollIntoView()
}

const closeModal = () => {
    needsModal.style.transform = 'scale(0)'
}
// show map view and change button colours
const showMap = () => {
    foodbankList.style.display = 'none'
    document.querySelector('.map-btn').classList.remove('inactive')
    document.querySelector('.list-btn').classList.add('inactive')
    document.querySelector('.map-view').style.display = 'block'
    // retrieve saved tooltipdata
    getData()
}
// show list view and change button colours
const showList = () => {
    document.querySelector('.map-view').style.display = 'none'
    foodbankList.style.display = 'block'
    document.querySelector('.map-btn').classList.add('inactive')
    document.querySelector('.list-btn').classList.remove('inactive')
}

// event listeners
searchForm.addEventListener('submit', postcodeValidation)

document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('donate-button')) {
        getNeeds(e)
    }
})
document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('needs-modal-container')) {
        closeModal()
    }
})
document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('map-btn')) {
        showMap()
    } else if (e.target && e.target.classList.contains('list-btn')) {
        showList()
    }
})

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.modal-close-btn').addEventListener('click', closeModal)
})

// map 
let map = null;  // This variable will hold the map instance
let markers = L.layerGroup()
const setMap = (toolTipData) => {
    showSpinner()
    // Convert lat long string to 2 numbers for the first item
    const [firstLat, firstLng] = toolTipData[0].lat_lng.split(',').map(Number)
    // check if the map has been initialised
    if (map == null) {
        // initialise map only if it hasn't been initialised before
        map = L.map('map', {
            center: [firstLat, firstLng],
            zoom: 12
        })
        // Add tile layer to the map
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map)
        // add the markers group to the map
        markers.addTo(map)
    } else {
        // If map already exists, update center
        map.setView([firstLat, firstLng], 12)
        // and remove existing markers
        markers.clearLayers()
    }
    // custom icon
    const logo = L.icon({
        iconUrl: 'imgs/mainLogo200x200.png',
        iconSize: [52, 52],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
    })
    // Iterate over each item in toolTipData
    toolTipData.forEach((item) => {
        // Convert lat long strings to 2 numbers
        const [lat, lng] = item.lat_lng.split(',').map(Number)
        // Create a marker with the custom icon and bind a popup to it
        const popupOptions = { className: "custom-popup", id: 'popup' }
        L.marker([lat, lng], { icon: logo })
            .addTo(markers)
            .bindPopup(item.content, popupOptions)
    })
    // hide spinner when map is loaded
    hideSpinner()
}
// save tooltipdata to localstorage to retrieve when map is rendered
const saveData = (toolTipData) => {
    localStorage.setItem("toolTipData", JSON.stringify(toolTipData))
}
// retrieve tooltipdata and pass it to the map to be rendered
const getData = () => {
    const returnedData = JSON.parse(localStorage.getItem("toolTipData"))
    setMap(returnedData)
}


