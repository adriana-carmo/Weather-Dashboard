$(document).ready(function(){

var history = JSON.parse(window.localStorage.getItem("history")) || [];

    $("#search-button").on("click", function(){
        var searchValue =  $("#search-value").val();

        if (searchValue != ""){

            $("#search-value").val("");

            console.log("enter if");
            searchWeather(searchValue);
        }
        
    })


$(".history").on("click", "li", function(){
    searchWeather($(this).text());
 
});

function makeRow(text){
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
}

function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
    }

function searchWeather(searchValue){
    console.log("searchWeather");
    
    // var date = new Date(null);
    // date.setSeconds(-14400); // specify value for SECONDS here
    // var resulttime = date.toISOString().substr(11, 8);
    // console.log(resulttime);
   // http://api.openweathermap.org/data/2.5/forecast/daily?q=paris&cnt=5&appid=ba34b33f61113cd89614cfe7a4ca1665 

    //Rons 4c023acf398932e1b43cd03002ad8542
    $.ajax({
        url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=4c023acf398932e1b43cd03002ad8542&units=imperial",
        method: "GET"
    }).then(function(data) {
        //$("#today").text(JSON.stringify(data));

        
        console.log(data);
        //Verify is the text in searchvalue contain in history array
        if (history.indexOf(searchValue)=== -1){
            history.push(searchValue);
            window.localStorage.setItem("history", JSON.stringify(history))

            makeRow(searchValue);
        } 
        
        
        $("#today").empty();

        var resulttime = secondsToDhms(data.timezone);
        console.log(resulttime);

        var title = $("<h3>").addClass("card-title").text(data.name  + " (" + new Date().toLocaleDateString('en-US') + ")");
        var card  = $("<div>").addClass("card");
        var wind  = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp  = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + "F");
        var cardbody = $("<div>").addClass("card-body");
        var img   = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
        
        //merge and add to page
        title.append(img);
        cardbody.append(title, temp, humid, wind);
        card.append(cardbody);

        //call follow-up api endpoints
        $("#today").append(card);

        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
    
    });
}

function getUVIndex(lat, long){
    $.ajax({
        url: "http://api.openweathermap.org/data/2.5/uvi?appid=ba34b33f61113cd89614cfe7a4ca1665&lat=" + lat + "&lon=" + long,
        method: "GET"
    }).then(function(response) {
       // $("#today").text(JSON.stringify(data));

    //    api.openweathermap.org/data/2.5/uvi?lat=37.75&lon=-122.37
    //    [{"lat":7.32,
    //     "lon":7.2,
    //     "date_iso":"2020-09-15T12:00:00Z",
    //     "date":1600171200,
    //     "value":13.71},

    //    {"lat":7.32,"lon":7.2,"date_iso":"2020-09-16T12:00:00Z","date":1600257600,"value":14.16},
    //    {"lat":7.32,"lon":7.2,"date_iso":"2020-09-17T12:00:00Z","date":1600344000,"value":14.36},
    //    {"lat":7.32,"lon":7.2,"date_iso":"2020-09-18T12:00:00Z","date":1600430400,"value":14.28},
    //    {"lat":7.32,"lon":7.2,"date_iso":"2020-09-19T12:00:00Z","date":1600516800,"value":13.9},
    //    {"lat":7.32,"lon":7.2,"date_iso":"2020-09-20T12:00:00Z","date":1600603200,"value":13.22},
    //    {"lat":7.32,"lon":7.2,"date_iso":"2020-09-21T12:00:00Z","date":1600689600,"value":12.95},
    //    {"lat":7.32,"lon":7.2,"date_iso":"2020-09-22T12:00:00Z","date":1600776000,"value":13.81}
    // ]

    //    var dataUV = JSON.stringify(response);
        
    //    debugger
    //    for(var i=0; i < dataUV.length; i++){
    //     console.log(dataUV[i].value); 
    //    }


    /*$.ajax({
        type: "GET",
        url: "http://api.openweathermap.org/data/2.5/uvi/forecast?appid=4c023acf398932e1b43cd03002ad8542&lat=" + lat + "&lon=" + long,
        //url: "https://openweathermap.org/api",
        datatype: "json",
        sucess: function(data){*/
           var uv = $("<p>").text("UV Index: ");
           var btn = $("<span>").addClass("btn btn-sm").text(response.value);
        
           if (response.value <3){
               btn.addClass("btn-sucess");
           }
           else if(response.value < 7){
               btn.addClass("btn-warning")
           }
           else{
               btn.addClass("btn-danger")
           }

           $("#today .card-body").append(uv.append(btn));
         })
}

function getForecast(searchValue){

    $("#forecast").empty();

    $.ajax({
        type: "GET",
        url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=4c023acf398932e1b43cd03002ad8542&units=imperial",
        dataType: "json",
        success: function(forecast5){
            console.log(forecast5.list.length);
            console.log(forecast5);


//             var forecastArr = JSON.stringify(forecast);
//             console.log(forecastArr.length);

        var row1 = $("<div>").addClass("row");    
        var titleday = $("<h5>").addClass("text-dark").text("5 Days-Forecast");
        row1.append(titleday);
        
        var row2 = $("<div>").addClass("row");    

        for(var i = 0; i < forecast5.list.length; i +=8)
        {
        console.log(forecast5.list[i]);
        //var days = (forecast5.list[i].dt_txt).toString("yyyy-MM-dd");
        
        //var days = moment(forecast5.list[i].dt_txt).format('MMMM Do YYYY');
        var week = moment(forecast5.list[i].dt_txt).format('llll');

        var divCar = $("<div>").addClass("card border-dark mb-3").css( "width", "190px" ) //.css("width: 18rem");
        var title = $("<h3>").addClass("card-header").text(week);
        var img   = $("<img>").attr("src", "http://openweathermap.org/img/w/" + forecast5.list[i].weather[0].icon + ".png");
        var divInt = $("<div>").addClass("card-body");
        var wind  = $("<p>").addClass("card-text").text("Wind Speed: " + forecast5.list[i].wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + forecast5.list[i].main.humidity + "%");
        var temp  = $("<p>").addClass("card-text").text("Temperature: " + forecast5.list[i].main.temp + " F");
        
              //merge and add to page
          //title.append(img);
          divInt.append(img, temp, humid, wind);
          divCar.append(title, divInt);
          row2.append(divCar);
  
          //call follow-up api endpoints
          $("#forecast").append(row1, row2);
       

        }

    }});
        // //merge and add to page
        // title.append(img);
        // cardbody.append(title, temp, humid, wind);
        // card.append(cardbody);

        
        

// {/* <div class="card" style="width: 18rem;">
//   <div class="card-body">
//     <h5 class="card-title">Card title</h5>
//     <h6 class="card-subtitle mb-2 text-muted">Card subtitle</h6>
//     <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
//     <a href="#" class="card-link">Card link</a>
//     <a href="#" class="card-link">Another link</a>
//   </div>
// </div> */}


}


if(history.length >0){
    searchValue = history[(history.length)-1];
    searchWeather(searchValue)
}

for(var i = 0; i < history.length; i++){
    makeRow(history[i]);
}

});