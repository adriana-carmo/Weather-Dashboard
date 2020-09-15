$(document).ready(function(){

var history = JSON.parse(window.localStorage.getItem("history")) || [];

    $("#search-button").on("click", function(){
        var searchValue =  $("#search-value").val();

        console.log("enter");

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
    $.ajax({
        type: "GET",
        url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=4c023acf398932e1b43cd03002ad8542&units=imperial",
        dataType: "json",
        success: function(data1){
            console.log(data1);

        }});


    $.ajax({
        url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=4c023acf398932e1b43cd03002ad8542&units=imperial",
        method: "GET"
    }).then(function(data) {
        //$("#today").text(JSON.stringify(data));



  
        
        //console.log(data);
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
        url: "http://api.openweathermap.org/data/2.5/uvi?appid=4c023acf398932e1b43cd03002ad8542&lat=" + lat + "&lon=" + long,
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

        console.log(searchValue);
        var divCar = $("<div>").addClass("card").css( "color", "red" ) //.css("width: 18rem");
//var divInt = $("<div>").addClass("card-body");
        var title = $("<h3>").addClass("card-title").text(searchValue + "(" + new Date().toLocaleDateString('en-US') + ")");
        var card  = $("<div>").addClass("card");
        var img   = $("<img>").attr("src", "http://openweathermap.org/img/w/10d.png");
        var wind  = $("<p>").addClass("card-text").text("Wind Speed: MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: %");
        var temp  = $("<p>").addClass("card-text").text("Temperature: F");

        // //merge and add to page
        // title.append(img);
        // cardbody.append(title, temp, humid, wind);
        // card.append(cardbody);

          //merge and add to page
          title.append(img);
          card.append(temp, humid, wind);
          divCar.append(title, card);
  
          //call follow-up api endpoints
          $("#forecast").append(divCar);
        

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
    searchWeather(history[(history.length)-1])
}

for(var i = 0; i < history.length; i++){
    makeRow(history[i]);
}

});