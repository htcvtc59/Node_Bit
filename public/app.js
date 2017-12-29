var socket = io.connect('https://app-bit-nodejs.herokuapp.com');
// http://localhost:3000

var accountlogin = {
    acc_name: null,
    acc_btc: null,
    acc_usd: null,
    acc_id: null
}

// First Loading Page
socket.on('loadingfirsthistory', function (data) {
    $.each(data, function (index, element) {
        var typeStyle = '';
        if (element.type === "sell") {
            typeStyle = `<td style="color: #ef5350;">Sell</td>`;
        } else {
            typeStyle = `<td style="color: #4caf50" >Buy</td>`;
        }

        $('#history_content_value').append(`
        <tr id="` + element.id + `">
                <td>` + element.market.toUpperCase() + `</td>
                ` + typeStyle + `
                <td>` + "Exchange" + `</td>
                <td>` + element.price_share + `</td>
                <td>` + element.amount_usd + `</td>
                <td>` + element.fee + ` BTC (0.15%)</td>
                <td>` + element.total + ` BTC</td>
                <td>` + moment(element.transaction_date).format("DD-MM-YYYY HH:mm:ss a") + `</td>
            </tr>`);
    });

});

socket.on('loadingfirstsell', function (data) {
    $.each(data, function (index, element) {

        $('#sell_content_value').append(`<tr id="sell_` + element._id + `" >
        <td class="sell_click_by sell_per` + element._id + `" data-id="` + element._id + `"  date-personal="` + element.personal + `"  >`
            + element.price_per_btc + `</td>
        <td class="sell_click_by sell_btc` + element._id + `" data-id="` + element._id + `" date-personal="` + element.personal + `"  >` + element.btc_amount + `</td> 
        <td class="sell_click_by sell_fee` + element._id + `" data-id="` + element._id + `" date-personal="` + element.personal + `"  >`
            + element.fee + `</td>
        <td class="sell_click_by sell_total` + element._id + `" data-id="` + element._id + `" date-personal="` + element.personal + `" >` + element.total + `</td> </tr>`);


    });
});

socket.on('loadingfirstbuy', function (data) {
    $.each(data, function (index, element) {

        $('#buy_content_value').append(`<tr id="buy_` + element._id + `" >
        <td class="buy_click_by buy_per` + element._id + `" data-id="` + element._id + `"  date-personal="` + element.personal + `" >`
            + element.price_per_btc + `</td>
        <td class="buy_click_by buy_btc` + element._id + `" data-id="` + element._id + `"  date-personal="` + element.personal + `" >` + element.btc_amount + `</td> 
        <td class="buy_click_by buy_fee` + element._id + `" data-id="` + element._id + `"  date-personal="` + element.personal + `" >`
            + element.fee + `</td>
        <td class="buy_click_by buy_total` + element._id + `" data-id="` + element._id + `" date-personal="` + element.personal + `" >` + element.total + `</td> </tr>`);

    });
});

//try click
socket.on('try account added', function (data) {
    var name = data.acc_name;
    var pass = data.acc_pass;
    var btc = data.acc_btc;
    var usd = data.acc_usd;

    $('#accountsname').text("Name: " + name);
    $('#accountspass').text("Pass: " + pass);
    $('#accountsbtc').text("BTC: " + btc);
    $('#accountsamount').text("Amount USD: " + usd);
});

//Login Check
socket.on('login check account', function (data) {
    if (data != null) {
        accountlogin.acc_name = data.acc_name;
        accountlogin.acc_btc = data.acc_btc;
        accountlogin.acc_usd = data.acc_usd;
        accountlogin.acc_id = data._id;

        $('#status_logined').removeAttr("data-toggle");
        $('#status_logined').removeAttr("data-target");
        $('#status_logined').addClass("dropdown");

        $('#status_logined').html(`<a class="dropdown-toggle"
                 id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Logined
                </a>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <div class="dropdown-item" href="#">Name: ` + accountlogin.acc_name + `</div>
                    <div class="dropdown-item" href="#">BTC: ` + accountlogin.acc_btc + `</div>
                <div class="dropdown-item" href="#">Amount USD: ` + accountlogin.acc_usd + `</div>
                <div class="dropdown-divider"></div>
                    <a  class="dropdown-item" onclick="logout()">Logout</a>
                </div>`);

        $('#exampleModalLogin').modal('hide');
        $('#exampleModalLabelLogin').text("Login");
    } else {
        $('#exampleModalLabelLogin').text("Login Fail");
    }
});

socket.on('sell_val_res', function (data) {
    var result = JSON.parse(data);
    console.log(result);

    if (result.sell === "exists") {
        $('.alert_message').show();
        $('.alert_message').fadeOut(3000);
    }

    if (result.sell != null && result.buy != null
        && result.history != null) {
        var sell = result.sell;
        var buy = result.buy;
        var history = result.history;

        $('#sell_' + sell.id).remove();
        $('#buy_' + buy.id).remove();

        var typeStyle = '';
        if (history.type === "sell") {
            typeStyle = `<td style="color: #ef5350;">Sell</td>`;
        } else {
            typeStyle = `<td style="color: #4caf50" >Buy</td>`;
        }

        $('#history_content_value').prepend(`
        <tr id="` + history.id + `">
                <td>` + history.market.toUpperCase() + `</td>
                ` + typeStyle + `
                <td>` + "Exchange" + `</td>
                <td>` + history.price_share + `</td>
                <td>` + history.amount_usd + `</td>
                <td>` + history.fee + ` BTC (0.15%)</td>
                <td>` + history.total + ` BTC</td>
                <td>` + moment(history.transaction_date).format("DD-MM-YYYY HH:mm:ss a") + `</td>
            </tr>`);

    }

    if (result.sell != null && result.sell != "exists" && result.buy == null
        && result.history == null) {
        var id = result.sell._id;
        var price_per_btc = result.sell.price_per_btc;
        var btc_amount = result.sell.btc_amount;
        var total = result.sell.total;
        var fee = result.sell.fee;
        var personalsell = result.sell.personal;

        $('#sell_content_value').prepend(`<tr id="sell_` + id + `" >
                      <td class="sell_click_by sell_per` + id + `" data-id="` + id + `"  date-personal="` + personalsell + `" >`
            + price_per_btc + `</td>
                      <td class="sell_click_by sell_btc` + id + `" data-id="` + id + `"  date-personal="` + personalsell + `" >` + btc_amount + `</td>
                      <td class="sell_click_by sell_fee` + id + `" data-id="` + id + `"  date-personal="` + personalsell + `" >`
            + fee + `</td>
                      <td class="sell_click_by sell_total` + id + `" data-id="` + id + `" date-personal="` + personalsell + `" >` + total + `</td> </tr>`);
    }

});


socket.on('buy_val_res', function (data) {
    var result = JSON.parse(data);
    console.log(result);

    if (result.buy === "exists") {
        $('.alert_message').show();
        $('.alert_message').fadeOut(3000);
    }

    if (result.buy != null && result.sell != null
        && result.history != null) {
        var sell = result.sell;
        var buy = result.buy;
        var history = result.history;

        $('#sell_' + sell.id).remove();
        $('#buy_' + buy.id).remove();

        var typeStyle = '';
        if (history.type === "sell") {
            typeStyle = `<td style="color: #ef5350;">Sell</td>`;
        } else {
            typeStyle = `<td style="color: #4caf50" >Buy</td>`;
        }

        $('#history_content_value').prepend(`
        <tr id="` + history.id + `">
                <td>` + history.market.toUpperCase() + `</td>
                ` + typeStyle + `
                <td>` + "Exchange" + `</td>
                <td>` + history.price_share + `</td>
                <td>` + history.amount_usd + `</td>
                <td>` + history.fee + ` BTC (0.15%)</td>
                <td>` + history.total + ` BTC</td>
                <td>` + moment(history.transaction_date).format("DD-MM-YYYY HH:mm:ss a") + `</td>
            </tr>`);

    }

    if (result.buy != null && result.buy != "exists" && result.sell == null
        && result.history == null) {
        var id = result.buy._id;
        var price_per_btc = result.buy.price_per_btc;
        var btc_amount = result.buy.btc_amount;
        var total = result.buy.total;
        var fee = result.buy.fee;
        var personalbuy = result.buy.personal;

        $('#buy_content_value').prepend(`<tr id="buy_` + id + `" >
            <td class="buy_click_by buy_per` + id + `" data-id="` + id + `"  date-personal="` + personalbuy + `" >`
            + price_per_btc + `</td>
            <td class="buy_click_by buy_btc` + id + `" data-id="` + id + `"  date-personal="` + personalbuy + `" >` + btc_amount + `</td> 
            <td class="buy_click_by buy_fee` + id + `" data-id="` + id + `"  date-personal="` + personalbuy + `" >`
            + fee + `</td>
            <td class="buy_click_by buy_total` + id + `" data-id="` + id + `" date-personal="` + personalbuy + `" >` + total + `</td> </tr>`);
    }

});

$(function () {
    // Login form
    $('#form_login').click(function (e) {
        e.preventDefault();
        var name = $('#logininputName').val();
        var pass = $('#logininputPassword').val();
        socket.emit('check login', JSON.stringify({ name: name, pass: pass }));
    });


    //Click Try

    $('#tryClick').click(function () {
        socket.emit('try account');
    });

    //Sell Form
    $('form.form_Sell').on("submit", function (e) {
        e.preventDefault();
        var market = jQuery('select[name="market"]').val();
        var price_per = jQuery('input[name="price_per"]').val();
        var btc = jQuery('input[name="btc"]').val();
        var usd = jQuery('input[name="usd"]').val();

        if (price_per + ''.length == 0 || btc + ''.lenght == 0) {
            return alert("Form not valid!");
        }

        if (accountlogin.acc_name === null) {
            alert("You must login , please!");
        } else {
            socket.emit('sell_val', {
                market: market,
                price_per: price_per,
                btc: btc,
                usd: usd,
                type: "sell",
                id: accountlogin.acc_id
            });
        }


    });

    //Buy Form
    $('form.form_Buy').on("submit", function (e) {
        e.preventDefault();
        var market = jQuery('select[name="market_buy"]').val();
        var price_per = jQuery('input[name="price_per_buy"]').val();
        var btc = jQuery('input[name="btc_buy"]').val();
        var usd = jQuery('input[name="usd_buy"]').val();

        if (price_per + ''.length == 0 || btc + ''.lenght == 0) {
            alert("Form not valid!");
        }

        if (accountlogin.acc_name === null) {
            alert("You must login , please!");
        } else {
            socket.emit('buy_val', {
                market: market,
                price_per: price_per,
                btc: btc,
                usd: usd,
                type: "buy",
                id: accountlogin.acc_id
            });
        }

    });

});


function logout() {
    $('#status_logined').html('');
    $('#status_logined').text("Login");

    $('#status_logined').attr("data-toggle", "modal");
    $('#status_logined').attr("data-target", "#exampleModalLogin");
    $('#status_logined').removeClass("dropdown");

    accountlogin.acc_id = null;
    accountlogin.acc_name = null;
    accountlogin.acc_usd = null;
    accountlogin.acc_btc = null;
}


$(function () {

    $('#sell_content_value').off('click').on('click', '.sell_click_by', function (e) {
        e.preventDefault();
        var id = $(this).data('id');
        var price = $('.sell_per' + id).text();
        var btc = $('.sell_btc' + id).text();
        var usd = $('.sell_total' + id).text();

        $('#sell_price_text').val(price);
        $('#sell_btcamount_text').val(btc);
        $('#sell_usdamount_text').val(price * btc);
        $('#sell_resultbtc_text').text(price * btc + " USD");

        $('#buy_price_text').val(price);
        $('#buy_btcamount_text').val(btc);
        $('#buy_usdamount_text').val(price * btc);
        $('#buy_resultbtc_text').text(price * btc + " USD");
    });

    $('#sell_price_text').keyup(function () {
        var price = $('#sell_price_text').val();
        var btc = $('#sell_btcamount_text').val();
        $('#sell_usdamount_text').val(price * btc);
        $('#sell_resultbtc_text').text(price * btc + " USD");
    });

    $('#sell_btcamount_text').keyup(function () {
        var price = $('#sell_price_text').val();
        var btc = $('#sell_btcamount_text').val();
        $('#sell_usdamount_text').val(price * btc);
        $('#sell_resultbtc_text').text(price * btc + " USD");
    });

    $('#buy_price_text').keyup(function () {
        var price = $('#buy_price_text').val();
        var btc = $('#buy_btcamount_text').val();
        $('#buy_usdamount_text').val(price * btc);
        $('#buy_resultbtc_text').text(price * btc + " USD");
    });

    $('#buy_btcamount_text').keyup(function () {
        var price = $('#buy_price_text').val();
        var btc = $('#buy_btcamount_text').val();
        $('#buy_usdamount_text').val(price * btc);
        $('#buy_resultbtc_text').text(price * btc + " USD");
    });


    $('#buy_content_value').off('click').on('click', '.buy_click_by', function (e) {
        e.preventDefault();
        var id = $(this).data('id');
        var price = $('.buy_per' + id).text();
        var btc = $('.buy_btc' + id).text();
        var usd = $('.buy_total' + id).text();


        $('#buy_price_text').val(price);
        $('#buy_btcamount_text').val(btc);
        $('#buy_usdamount_text').val(price * btc);
        $('#buy_resultbtc_text').text(price * btc + " USD");

        $('#sell_price_text').val(price);
        $('#sell_btcamount_text').val(btc);
        $('#sell_usdamount_text').val(price * btc);
        $('#sell_resultbtc_text').text(price * btc + " USD");

    });

});




