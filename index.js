const searchForm = document.querySelector('.search-form')
const userInput = document.querySelector('#user-input')


const getFoodbanks = async (e) => {
    e.preventDefault()
    // show loading spinner
    showSpinner()
    try {
        const res = await fetch(`https://www.givefood.org.uk/api/2/foodbanks/search/?address=${userInput.value}`)
        if (!res.ok) {
            showError()
        }
        const data = await res.json()
        // run function to show data
        displayFoodbanks(data)
    } catch (error) {
        console.log(error)
    }
}

const displayFoodbanks = (foodbanks) => {
    const foodbankList = document.querySelector('.foodbank-list')
    // add a title to the foodbank list container
    foodbankList.innerHTML = '<h3>Foodbanks Near You</h3>'
    // create a card for every foodbank from the search results
    foodbanks.forEach(({ name, address, phone, email, distance_mi, urls }) => {
        const foodbankCard = `
    <div class="foodbank-card grid">
    <div class="foodbank-card-text">
        <h4>${name}</h4>
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
        <div class="foodbank-card-image">
        <img src="${urls.map}" alt="${name} google maps">
        </div>
    </div>
`
        // add cards to the container
        foodbankList.innerHTML += foodbankCard

    })
    // hide the loading spinner
    hideSpinner()
    // scroll to the first card
    scrollToCard(foodbankList)
    // reset the user input
    searchForm.reset()
}


// show or hide loading spinner when data is fetched
const showSpinner = () => {
    document.querySelector('.loading-spinner-overlay').style.display = 'flex';
}
const hideSpinner = () => {
    document.querySelector('.loading-spinner-overlay').style.display = 'none';
}
// show error to the user
const showError = () => {
    document.querySelector('.search').innerHTML += `<p>Error fetching data, please try again after some time.</p>`
}

const scrollToCard = (foodbankList) => {
    foodbankList.scrollIntoView();
};


searchForm.addEventListener('submit', getFoodbanks)
