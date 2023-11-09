const searchForm = document.querySelector('.search-form')
const userInput = document.querySelector('#user-input')
const needsModal = document.querySelector('.needs-modal-container')

// check users postcode input
const postcodeValidation = async (e) => {
    e.preventDefault()
    showSpinner()
    try {
        const res = await fetch(`https://api.postcodes.io/postcodes/${userInput.value}/validate`)
        const data = await res.json()
        if (!res.ok || !data.result) {
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
        hideSpinner()
    }
}

// display the foodbanks in cards
const displayFoodbanks = (foodbanks) => {
    const foodbankList = document.querySelector('.foodbank-list')
    // add a title to the foodbank list container
    foodbankList.innerHTML = `
    <h4>Foodbanks Near You</h4>
    <p>${foodbanks.length} Results found in ${userInput.value.toUpperCase()}</p>
`
    // create a card for every foodbank from the search results
    foodbanks.forEach(({ name, address, phone, email, distance_mi, urls, needs }) => {
        const foodbankCard = `
    <div class="foodbank-card grid">
    <div class="foodbank-card-text">
        <h4>${name}</h4>
        <div class="foodbank-card-text-info">
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
        </div>
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
    })
    // scroll to the first card
    scrollToCard(foodbankList)
}

// get needs of individual foodbank
const getNeeds = async (e) => {
    showSpinner()
    try {
        const res = await fetch(`https://www.givefood.org.uk/api/2/need/${e.target.id}/`)
        if (!res.ok) {
            // to be updated to show the user the error
            // 
            // 
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
// show error to the user
const showError = () => {
    hideSpinner()
    document.querySelector('.search').innerHTML += `<p>Error fetching data, please try again after some time.</p>`
}
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


document.addEventListener('DOMContentLoaded', (e) => {
    document.querySelector('.modal-close-btn').addEventListener('click', closeModal)
})
