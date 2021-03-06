$(document).ready(function(){

var historyCities = JSON.parse(window.localStorage.getItem("history")) || [];

    $("#search-button").on("click", function(){
        var searchValue =  $("#search-value").val();

        if (searchValue != ""){

            $("#search-value").val("");

            searchWeather(searchValue);
        }
        else{
            alert('Please fill out the name of the city.');
        }
    })


$(".history").on("click", "li", function(){
    searchWeather($(this).text());
 
});

//Make row of the cities that have already been searched 
function makeRow(text){
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
}

//Get information from API and show up in the page - div Today
function searchWeather(searchValue){
   
    //call API 
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=ba34b33f61113cd89614cfe7a4ca1665&units=imperial",
        method: "GET"
    }).then(function(data) {
       
        
        //Verify is the text in searchvalue contain in history array
        if (historyCities.indexOf(searchValue)=== -1){
            historyCities.push(searchValue);
            window.localStorage.setItem("history", JSON.stringify(historyCities))

            makeRow(searchValue);
        } 
        
        $("#today").empty();

        var card  = $("<div>").addClass("card");
        var cardbody = $("<div>").addClass("card-body");
        var city = $("<h3>").addClass("card-title").text(data.name + "/" + data.sys.country   + " - (" + new Date().toLocaleDateString('en-US') + ")");
        var img   = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
        var wind  = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp  = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + String.fromCharCode(176));
        
        //merge and add to page
        city.append(img);
        cardbody.append(city, temp, humid, wind);
        card.append(cardbody);

        //call follow-up api endpoints
        $("#today").append(card);

        //Call function
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
    
    });
}

function getUVIndex(lat, long){
    //Call API UVIndex
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=ba34b33f61113cd89614cfe7a4ca1665&lat=" + lat + "&lon=" + long,
        method: "GET"
    }).then(function(response) {
           var uv = $("<p>").text("UV Index: ");
           var btncolor = $("<span>").addClass("btn btn-sm").text(response.value);
        
           if (response.value <3){
                btncolor.addClass("btn-sucess");
           }
           else if(response.value < 7){
                btncolor.addClass("btn-warning")
           }
           else{
                btncolor.addClass("btn-danger")
           }

           //Append in the div #today to show up in the page
           uv.append(btncolor) 
           $("#today .card-body").append(uv);
         })
}

//Show 5 day forecast in Page
function getForecast(searchValue){

    $("#forecast").empty();
    $("#titleforecast").empty();

    $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=ba34b33f61113cd89614cfe7a4ca1665&units=imperial",
        dataType: "json",
        success: function(forecast5){
       
            //title 5 Days Forecast
            var titleday = $("<h5>").addClass("text-dark").text("5 Days-Forecast");
            $("#titleforecast").append(titleday);
    
            for(var i = 0; i < forecast5.list.length; i++   )
            {
                
                //Show forecast only 15:00 the each day
                if((forecast5.list[i].dt_txt).indexOf("15:00:00")  > -1) {

                    var forecastday = new Date(forecast5.list[i].dt_txt).toLocaleDateString('en-US');
                    var icon = forecast5.list[i].weather[0].icon + ".png";
                    var wind = "Wind Speed: " + forecast5.list[i].wind.speed + " MPH";
                    var humidity = "Humidity: " + forecast5.list[i].main.humidity + "%";
                    var temp = "Temper: " + forecast5.list[i].main.temp + String.fromCharCode(176)
                
                    var weekday = moment(forecast5.list[i].dt_txt).format('dddd');

                
                    var divCar = $("<div>").addClass("card border-dark  mb-3").css("width", "20%");
                    var title  = $("<h4>").addClass("card-header").text(weekday);
                    var subtitle = $("<p>").addClass("card-header").css("font-size", "small").text(forecastday);
                    var img    = $("<img>").attr("src", "http://openweathermap.org/img/w/" + icon );
                    var divInt = $("<div>").addClass("card-body");
                    var wind   = $("<p>").addClass("text-muted").css("font-size", "small").text(wind);
                    var humid  = $("<p>").addClass("text-muted").css("font-size", "small").text(humidity);
                    var temp   = $("<p>").addClass("text-muted").css("font-size", "small").text(temp);
                    
                    
                    //append all information       
                    divInt.append(img, temp, humid, wind);
                    divCar.append(title, subtitle, divInt);
                
                    //merge and add to page
                    $("#forecast").append(divCar);
                }
            }
        }
    });
 }

//verify in LocalStorage the cities
if(historyCities.length >0){
    searchValue = historyCities[(historyCities.length)-1];
    searchWeather(searchValue)
}

// Fill in the cities that have already been searched
for(var i = 0; i < historyCities.length; i++){
    makeRow(historyCities[i]);
}

});