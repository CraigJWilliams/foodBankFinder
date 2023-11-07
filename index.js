const searchForm = document.querySelector('.search-form')
const userInput = document.querySelector('#user-input')

const getFoodbanks = async (e) => {
    e.preventDefault()
    try {
        const res = await fetch(`https://www.givefood.org.uk/api/2/foodbanks/search/?address=${userInput.value}`)
        if (!res.ok) {
            throw new Error('failed to fetch data')
        }
        const data = await res.json()
        displayFoodbanks(data)
    } catch (error) {
        console.log(error)
    }
}

const displayFoodbanks = (foodbanks) => {
    const foodbankList = document.querySelector('.foodbank-list')
    foodbankList.innerHTML = ''

    foodbanks.forEach(({ name, address, phone, email, distance_mi, urls }) => {
        const foodbankCard = `
    <div class="foodbank-card grid">
    <div class="foodbank-card-text">
        <h3>${name}</h3>
        <p>Address: ${address}</p>
        <p>Distance: ${distance_mi} miles</p>
        <p>Phone: ${phone} </p>
        <p>Email: ${email} </p>
        </div>
        <div class="foodbank-card-image">
        <img src="${urls.map}">
        </div>
    </div>
`

        foodbankList.innerHTML += foodbankCard
    })
}

searchForm.addEventListener('submit', getFoodbanks)
