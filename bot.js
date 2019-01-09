require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const weather = require("weather-js");

const {
  env: {
    token
  }
} = process;

const bot = new TelegramBot(token, {
  polling: true
});

// Ponemos la primera letra en mayuscula

capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Controlamos si tiene precipitaciones

controlRainfall = string => {
  if (!string) {
    return 0;
  }
  return string;
};

// Controlamos los emojis dependiendo del dia que hace

emojisForDays = string => {
  if (string === "Muy soleado" || string === "Soleado") {
    return "☀️";
  } else if (
    string === "Prácticamente despejado" ||
    string === "Parc. soleado"
  ) {
    return "🌤";
  } else if (
    string === "Parc. nublado" ||
    string === "Muy nublado" ||
    string === "Nublado"
  ) {
    return "⛅️";
  } else if (
    string === "Lluvia" ||
    string === "Llovizna") {
    return "🌧"
  } else if (
    string === "Tormentas" ||
    string === "Chubascos"
  ) {
    return "⛈";
  } else if (string === "Nieve") {
    return "❄️"
  }
};

// Cuando el bot recibe el parametro /start manda un saludo

bot.onText(/^\/start/, function (msg) {
  const chatId = msg.chat.id;
  const username = msg.from.username;

  bot.sendMessage(
    chatId,
    "Hola, " +
    username +
    " soy un bot y mi nombre es Climacito" +
    "\n" +
    "Escribe /clima nombredelacity para informarte del tiempo"
  );
});

// Cuando el bot recibe la palabra hola bot, devolvemos un saludo

bot.on("message", function (msg) {
  const sayHello = "hola bot";

  if (msg.from.first_name === undefined) {
    const firstnameuser = "Usuario sin username";
  }
  const firstnameuser = msg.from.first_name;
  if (
    msg.text
    .toString()
    .toLowerCase()
    .includes(sayHello)
  ) {
    bot.sendMessage(msg.chat.id, "Hola " + firstnameuser + ", como estás?");
  }
});

// Cuando el bot recibe el parametro /clima ciudad devolvemos toda la informacion

bot.onText(/^\/clima (.+)/, function (msg, match) {
  const chatId = msg.chat.id;
  const city = match[1];

  const opciones = {
    search: city, // lugar es la ciudad que el usuario introduce
    degreeType: "C", // Celsius
    lang: "es-ES" // Lenguaje en el que devolverá los datos
  };

  weather.find(opciones, async function (err, result) {
    if (err) {
      // Si ocurre algun error...
      bot.sendMessage(chatId, "El servidor no esta opeartivo");
    } else if (!result[0]) {
      bot.sendMessage(chatId, "La ciudad introducida no existe");
    } else {
      await bot.sendMessage(
        chatId,
        "Lugar: " +
        result[0].location.name +
        " " +
        this.emojisForDays(result[0].current.skytext) +
        "\n\nTemperatura: " +
        result[0].current.temperature +
        "ºC\n" +
        "Estado del cielo: " +
        result[0].current.skytext +
        "\n" +
        "Humedad: " +
        result[0].current.humidity +
        "%\n" +
        "Dirección del viento: " +
        result[0].current.winddisplay,

        {
          parse_mode: "Markdown"
        }
      );

      const days = result[0].forecast.slice(2, result[0].forecast.length);

      call = async days => {
        const element = days[0];
        await bot.sendMessage(
          chatId,
          this.capitalizeFirstLetter(element.day) +
          " " +
          this.emojisForDays(element.skytextday) +
          "\n\n" +
          "Temperatura minima: " +
          element.low +
          "\n" +
          "Temperatura maxima: " +
          element.high +
          "\n" +
          "Precipitaciones: " +
          this.controlRainfall(element.precip) +
          "%\n" +
          "Estado del cielo: " +
          element.skytextday, {
            parse_mode: "Markdown"
          }
        );

        if (days.length) {
          days.splice(0, 1);

          call(days);
        }
      };

      call(days);

    }
  });
});