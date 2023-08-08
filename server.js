const express = require("express");
const app = express();
const mysql = require('mysql2');
const db = require('./datenbank.js'); /*Importieren einer Datei namens "datenbank.js", die eine Datenbankverbindung aufstellt.*/
app.use(express.json()); /*Ermöglichen das Parsen von JSON im body der Anfrage*/

const HTTP_PORT = 8080; /*Port auf dem der Server läuft*/

/*Hier wird der Server gestartet*/
app.listen(HTTP_PORT, () => {
  console.log(`Server started on port ${HTTP_PORT}`);
});

/*Eine einfache API-Route, die bei GET-Anfragen eine Nachricht zurückgibt*/
app.get("/api", (req, res) => {
  res.json({ message: "Hello World" });
});

/*Eine API-Route, die alle Einträge aus der Kundentabelle abruft*/
app.get("/api/customers", (req, res) => {
  let sql = "SELECT * FROM customer"; /*SQL-Befehl, um alle Daten aus der Tabelle "customer" zu holen*/
  let parameter = [];
  console.time("Database Query"); /*Start der Zeitmessung für die Datenbankabfrage*/
  db.query(sql, parameter, (err, rows) => { /*Ausführen des SQL-Befehls*/
    console.timeEnd("Database Query"); /*Ende der Zeitmessung für die Datenbankabfrage*/
    if (err) {
      res.status(400).json({ message: err.message }); /*Senden eines Fehlers, wenn die Datenbankabfrage fehlschlägt*/
      return;
    }
    /*Senden der Antwort, wenn die Datenbankabfrage erfolgreich ist*/
    res.json({
      message: "Success",
      data: rows,
      
    });
  });
});

  /*Eine Funktion zum Erzeugen einer festgelegten Anzahl von Kundeneinträgen*/
  function generateCustomers(numCustomers) {
    return new Promise((resolve, reject) => {
      /*Abrufen der kundendaten aus der Kundentabelle, um eindeutige IDs für die neuen Einträge zu generieren*/
      db.query('SELECT * FROM customer', (err, result) => {
        if (err) {
          reject(err);
        } else {
          const customers = [];
          for(let i = 1; i <= numCustomers; i++) { /*Hier werden einige zufällige Daten für die Kunden generiert*/
            const id =  i;
            const user = `user${id}`;
            const password = `password${id}`;
            const firstName = `First${id}`;
            const lastName = `Last${id}`;
            const address = `address${id}`;
            const email = `${user}@example.com`;
            const c_since = 1 + (i * 0.1);
            const last_login = `2022-06-${String((i % 30) + 1).padStart(2, '0')}`;;
            const login = user;
            const expiration = `2023-06-${String((i % 30) + 1).padStart(2, '0')}`;
            const discount = (i * 0.1).toFixed(1);
            const balance = String(i * 100);
            const ytd_pmt = String(i * 1000);
            const birthdate = `1990-${String((i % 12) + 1).padStart(2, '0')}-10`;
            customers.push([id, user, password, firstName, lastName, address, email, c_since, last_login, login, expiration, discount, balance, ytd_pmt, birthdate]);
          }
          resolve(customers); /*Die generierten Kunden werden zurückgegeben*/
        }
      });
    });
  }
  /*Eine API-Route, die eine bestimmte Anzahl von Kundeneinträgen generiert und sie in die Datenbank einfügt*/
  app.post("/api/generateCustomers", async (req, res) => {
    if (!req.body.numCustomers) {
        res.status(400).json({ message: "numCustomers is required" });
        return;
    }

    try {
        /*Löschen Sie zuerst alle vorhandenen Kunden aus der Datenbank.*/
        const deleteQuery = `DELETE FROM customer`;
        db.query(deleteQuery, async (err) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: err.message });
                return;
            }

            /*Dann fügen Sie die neuen Kunden hinzu.*/
            const numCustomers = req.body.numCustomers; /*Anzahl der zu generierenden Kunden*/
            const customers = await generateCustomers(numCustomers);
        
            /*SQL-Befehl zum Einfügen der generierten Kunden in die Datenbank*/
            const insertQuery = `
            INSERT INTO customer (C_id, C_UNAME, C_PASSWD, C_FNAME, C_LNAME, C_ADDR_ID, C_EMAIL, C_SINCE, C_LAST_LOGIN, C_LOGIN, C_EXPIRATION, C_DISCOUNT, C_BALANCE, C_YTD_PMT, C_BIRTHDATE)
            VALUES ?
            `;
            console.time("Database Query"); /*Start der Zeitmessung*/
            db.query(insertQuery, [customers], (err) => {
                console.timeEnd("Database Query");
                if (err) {
                    console.log(err);
                    res.status(500).json({ message: err.message });
                    return;
                }
                res.json({ message: "Data inserted successfully." });
            });
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});





