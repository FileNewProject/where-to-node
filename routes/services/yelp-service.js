const got = require('got')
const removeDiacritics = require('diacritics').remove;
const apiKey = process.env.YELP_TOKEN
const BASE_URL = 'https://api.yelp.com/v3/businesses/'
const reqOptions = {
    headers: { Authorization: 'Bearer ' + apiKey }
}

exports.getPlaces = function (latlng, type, openNow, radius) {
    let latLngSplit = latlng.split(',')
    let open_now = openNow === 'true' ? '&open_now=true' : ''
    let url = BASE_URL + 'search?categories=' + type + '&latitude=' + latLngSplit[0] + "&longitude=" + latLngSplit[1] + "&sort_by=distance&radius=" + radius + open_now
    return got(url, reqOptions)
        .then(buildData)
}

exports.getPlaceDetails = function (placeId) {
    return got(BASE_URL + placeId, reqOptions)
        .then(buildDetails)
}

exports.getReviews = function(placeId) {
    return got(BASE_URL + placeId + '/reviews', reqOptions)
        .then(buildReviews)
}

function buildReviews(response) {
    return new Promise((resolve, reject) => {
        let res = JSON.parse(response.body)
        resolve(res)
    })
}

function buildDetails(response) {
    return new Promise((resolve, reject) => {
        let res = JSON.parse(response.body)
        let photos = res.photos.map(item => {
            return { image: item }
        })

        let result = { 
            name: res.name,
            rating: res.rating,
            location : res.coordinates,
            phone: res.display_phone,
            price: res.price,
            images: photos,
            review_count: res.review_count,
            web_url: res.url,
            is_open: !res.is_closed
         }
        resolve({ result: result })
    })
}

function buildData(response) {
    return new Promise((resolve, reject) => {
        let res = JSON.parse(response.body)
        let results = res.businesses.map(item => {
            let openNow = !item.is_closed
            let cleanedId = removeDiacritics(item.id)
            data = {
                id: cleanedId,
                name: item.name,
                rating: item.rating,
                vicinity: item.location.address1,
                image: item.image_url,
                distance: parseInt(item.distance),
                open_now: openNow
            }
            return data
        })

        resolve({ places: results })
    })
}